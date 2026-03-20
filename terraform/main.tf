# ============================================================
#  Flowki — GCP Infrastructure
#  Target budget: ~$10 USD / month
# ============================================================
#  Resources
#  ──────────
#  • Artifact Registry        — Docker image repository
#  • Cloud SQL (MySQL)        — db-f1-micro, single zone, no HA
#  • Secret Manager           — APP_KEY, DB_PASSWORD, CLOUDFLARE_API_TOKEN
#  • GCS Bucket               — Laravel cloud disk (FILESYSTEM_DISK=gcs)
#  • Cloud Run Service        — Application (scale-to-zero capable)
#  • Cloud Run Job            — php artisan migrate --force
#  • WIF Module               — Keyless GitHub Actions ↔ GCP auth
#  • IAM                      — Least-privilege service accounts
# ============================================================

terraform {
  required_version = ">= 1.5"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 5.0, < 6.0"
    }
    random = {
      source  = "hashicorp/random"
      version = ">= 3.5"
    }
  }

  # Remote state stored in a pre-existing GCS bucket.
  # Bootstrap this bucket manually before running `terraform init`.
  # See the README for instructions.
  backend "gcs" {
    # bucket and prefix are supplied via -backend-config or terraform.tfvars
  }
}

# ──────────────────────────────────────────────────────────────
# Provider
# ──────────────────────────────────────────────────────────────
provider "google" {
  project = var.project_id
  region  = var.region
}

# ──────────────────────────────────────────────────────────────
# Enable required APIs
# ──────────────────────────────────────────────────────────────
locals {
  enabled_apis = [
    "run.googleapis.com",
    "sqladmin.googleapis.com",
    "secretmanager.googleapis.com",
    "artifactregistry.googleapis.com",
    "iam.googleapis.com",
    "iamcredentials.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "storage.googleapis.com",
  ]
}

resource "google_project_service" "apis" {
  for_each = toset(local.enabled_apis)

  project            = var.project_id
  service            = each.value
  disable_on_destroy = false
}

# ──────────────────────────────────────────────────────────────
# Service Accounts
# ──────────────────────────────────────────────────────────────

# Cloud Run runtime identity
resource "google_service_account" "cloud_run" {
  project      = var.project_id
  account_id   = "${var.app_name}-run"
  display_name = "${var.app_name} Cloud Run Service Account"
}

# GitHub Actions CI/CD identity
resource "google_service_account" "github_actions" {
  project      = var.project_id
  account_id   = "${var.app_name}-cicd"
  display_name = "${var.app_name} GitHub Actions Service Account"
}

# ──────────────────────────────────────────────────────────────
# Workload Identity Federation (WIF) Module
# ──────────────────────────────────────────────────────────────
module "workload_identity" {
  source = "./modules/workload_identity"

  project_id         = var.project_id
  github_org         = var.github_org
  github_repo        = var.github_repo
  service_account_id = google_service_account.github_actions.account_id

  depends_on = [
    google_project_service.apis,
    google_service_account.github_actions,
  ]
}

# ──────────────────────────────────────────────────────────────
# IAM — Cloud Run service account roles
# ──────────────────────────────────────────────────────────────
locals {
  cloud_run_roles = [
    "roles/cloudsql.client",
    "roles/storage.objectAdmin",
    "roles/secretmanager.secretAccessor",
  ]
}

resource "google_project_iam_member" "cloud_run_roles" {
  for_each = toset(local.cloud_run_roles)

  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.cloud_run.email}"
}

# ──────────────────────────────────────────────────────────────
# IAM — GitHub Actions service account roles
# ──────────────────────────────────────────────────────────────
locals {
  github_actions_roles = [
    "roles/run.developer",
    "roles/artifactregistry.writer",
    "roles/iam.serviceAccountUser", # needed to act as the Cloud Run SA
    "roles/secretmanager.secretAccessor",
  ]
}

resource "google_project_iam_member" "github_actions_roles" {
  for_each = toset(local.github_actions_roles)

  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.github_actions.email}"
}

# GitHub Actions also needs to submit Cloud Run Jobs
resource "google_project_iam_member" "github_actions_run_jobs" {
  project = var.project_id
  role    = "roles/run.invoker"
  member  = "serviceAccount:${google_service_account.github_actions.email}"
}

# ──────────────────────────────────────────────────────────────
# Artifact Registry — Docker repository
# ──────────────────────────────────────────────────────────────
resource "google_artifact_registry_repository" "app" {
  project       = var.project_id
  location      = var.region
  repository_id = var.app_name
  description   = "${var.app_name} Docker images"
  format        = "DOCKER"

  depends_on = [google_project_service.apis]
}

# ──────────────────────────────────────────────────────────────
# Cloud SQL — MySQL (db-f1-micro, single zone, no HA)
# ──────────────────────────────────────────────────────────────
resource "random_id" "db_suffix" {
  byte_length = 4
}

resource "google_sql_database_instance" "mysql" {
  project          = var.project_id
  name             = "${var.app_name}-mysql-${random_id.db_suffix.hex}"
  database_version = "MYSQL_8_0"
  region           = var.region

  settings {
    tier              = "db-f1-micro"
    availability_type = "ZONAL" # single zone — no HA

    backup_configuration {
      enabled            = true
      binary_log_enabled = true # required for point-in-time recovery on MySQL
      start_time         = "03:00"
    }

    ip_configuration {
      # Cloud Run connects via Cloud SQL Auth Proxy (Unix socket).
      ipv4_enabled = true  # required when no private IP is used
      require_ssl  = true  # enforce TLS at the DB layer (defence-in-depth)
    }

    database_flags {
      name  = "slow_query_log"
      value = "on"
    }

    database_flags {
      name  = "long_query_time"
      value = "2"
    }

    deletion_protection_enabled = true
  }

  # Prevent accidental deletion via Terraform
  deletion_protection = true

  depends_on = [google_project_service.apis]
}

resource "google_sql_database" "app" {
  project  = var.project_id
  instance = google_sql_database_instance.mysql.name
  name     = var.db_name
  charset  = "utf8mb4"
  collation = "utf8mb4_unicode_ci"
}

resource "random_password" "db_password" {
  length           = 32
  special          = true
  override_special = "!#$%&*-_=+?"
}

resource "google_sql_user" "app" {
  project  = var.project_id
  instance = google_sql_database_instance.mysql.name
  name     = var.db_user
  password = random_password.db_password.result
  host     = "cloudsqlproxy~%"
}

# Store the generated password as the initial secret version so it is
# immediately available to Cloud Run at first boot.
resource "google_secret_manager_secret_version" "db_password_initial" {
  secret      = google_secret_manager_secret.db_password.id
  secret_data = random_password.db_password.result
}

# ──────────────────────────────────────────────────────────────
# Secret Manager
# ──────────────────────────────────────────────────────────────

# APP_KEY — Laravel application encryption key
resource "google_secret_manager_secret" "app_key" {
  project   = var.project_id
  secret_id = "${var.app_name}-app-key"

  replication {
    auto {}
  }

  depends_on = [google_project_service.apis]
}

# DB_PASSWORD — Cloud SQL user password
resource "google_secret_manager_secret" "db_password" {
  project   = var.project_id
  secret_id = "${var.app_name}-db-password"

  replication {
    auto {}
  }

  depends_on = [google_project_service.apis]
}

# CLOUDFLARE_API_TOKEN
resource "google_secret_manager_secret" "cloudflare_api_token" {
  project   = var.project_id
  secret_id = "${var.app_name}-cloudflare-api-token"

  replication {
    auto {}
  }

  depends_on = [google_project_service.apis]
}

# ──────────────────────────────────────────────────────────────
# GCS Bucket — Laravel cloud disk (FILESYSTEM_DISK=gcs)
# ──────────────────────────────────────────────────────────────
resource "google_storage_bucket" "laravel_storage" {
  project                     = var.project_id
  name                        = "${var.project_id}-${var.app_name}-storage"
  location                    = var.region
  uniform_bucket_level_access = true
  force_destroy               = false

  lifecycle_rule {
    condition {
      age = 365
    }
    action {
      type = "Delete"
    }
  }

  depends_on = [google_project_service.apis]
}

# ──────────────────────────────────────────────────────────────
# Cloud Run Service — Application
# ──────────────────────────────────────────────────────────────
locals {
  cloud_sql_connection = "${var.project_id}:${var.region}:${google_sql_database_instance.mysql.name}"
  db_socket_path       = "/cloudsql/${local.cloud_sql_connection}"
  image_placeholder    = "${var.region}-docker.pkg.dev/${var.project_id}/${var.app_name}/${var.app_name}:latest"
}

resource "google_cloud_run_v2_service" "app" {
  project  = var.project_id
  name     = var.app_name
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL" # Cloudflare is the entry point; no LB needed

  template {
    service_account = google_service_account.cloud_run.email

    scaling {
      min_instance_count = var.cloud_run_min_instances
      max_instance_count = var.cloud_run_max_instances
    }

    # Cloud SQL Auth Proxy sidecar (Unix socket)
    volumes {
      name = "cloudsql"
      cloud_sql_instance {
        instances = [local.cloud_sql_connection]
      }
    }

    containers {
      image = local.image_placeholder

      resources {
        limits = {
          cpu    = var.cloud_run_cpu
          memory = var.cloud_run_memory
        }
        cpu_idle = true # reduce cost when idle
      }

      # ── Non-sensitive environment variables ──────────────────
      env {
        name  = "APP_ENV"
        value = var.app_env
      }
      env {
        name  = "APP_DEBUG"
        value = "false"
      }
      env {
        name  = "APP_URL"
        value = var.app_url
      }
      env {
        name  = "APP_TIMEZONE"
        value = var.app_timezone
      }
      env {
        name  = "LOG_CHANNEL"
        value = "stderr"
      }
      env {
        name  = "LOG_LEVEL"
        value = "warning"
      }
      env {
        name  = "DB_CONNECTION"
        value = "mysql"
      }
      env {
        name  = "DB_SOCKET"
        value = local.db_socket_path
      }
      env {
        name  = "DB_DATABASE"
        value = var.db_name
      }
      env {
        name  = "DB_USERNAME"
        value = var.db_user
      }
      env {
        name  = "FILESYSTEM_DISK"
        value = "gcs"
      }
      env {
        name  = "GOOGLE_CLOUD_STORAGE_BUCKET"
        value = google_storage_bucket.laravel_storage.name
      }
      env {
        name  = "GOOGLE_CLOUD_PROJECT_ID"
        value = var.project_id
      }
      env {
        name  = "SESSION_DRIVER"
        value = "database"
      }
      env {
        name  = "CACHE_STORE"
        value = "database"
      }
      env {
        name  = "QUEUE_CONNECTION"
        value = "database"
      }
      # Trust all proxies — Cloud Run sits behind Google's GFE and Cloudflare.
      # Laravel will use TRUSTED_PROXIES to honour X-Forwarded-For headers.
      env {
        name  = "TRUSTED_PROXIES"
        value = "*"
      }
      # Tells the application which proxy sources to trust for real-IP resolution
      env {
        name  = "REMOTE_SOURCES"
        value = "cloudflare"
      }

      # ── Secrets mapped to environment variables ──────────────
      env {
        name = "APP_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.app_key.secret_id
            version = "latest"
          }
        }
      }
      env {
        name = "DB_PASSWORD"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.db_password.secret_id
            version = "latest"
          }
        }
      }
      env {
        name = "CLOUDFLARE_API_TOKEN"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.cloudflare_api_token.secret_id
            version = "latest"
          }
        }
      }

      # Mount the Cloud SQL socket volume
      volume_mounts {
        name       = "cloudsql"
        mount_path = "/cloudsql"
      }

      startup_probe {
        http_get {
          path = "/up"
          port = 8080
        }
        initial_delay_seconds = 10
        period_seconds        = 5
        failure_threshold     = 10
      }

      liveness_probe {
        http_get {
          path = "/up"
          port = 8080
        }
        period_seconds    = 30
        failure_threshold = 3
      }
    }
  }

  # Ignore the image tag managed by GitHub Actions so Terraform
  # doesn't revert it on subsequent `terraform apply` runs.
  lifecycle {
    ignore_changes = [
      template[0].containers[0].image,
      template[0].labels,
      template[0].revision,
      client,
      client_version,
    ]
  }

  depends_on = [
    google_project_iam_member.cloud_run_roles,
    google_sql_database_instance.mysql,
    google_secret_manager_secret.app_key,
    google_secret_manager_secret.db_password,
    google_secret_manager_secret.cloudflare_api_token,
  ]
}

# Allow unauthenticated (public) traffic via Cloudflare
resource "google_cloud_run_v2_service_iam_member" "public" {
  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_service.app.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# ──────────────────────────────────────────────────────────────
# Cloud Run Job — Database Migrations
# ──────────────────────────────────────────────────────────────
resource "google_cloud_run_v2_job" "migrate" {
  project  = var.project_id
  name     = "${var.app_name}-migrate"
  location = var.region

  template {
    template {
      service_account = google_service_account.cloud_run.email

      volumes {
        name = "cloudsql"
        cloud_sql_instance {
          instances = [local.cloud_sql_connection]
        }
      }

      containers {
        image = local.image_placeholder

        command = ["php", "artisan", "migrate", "--force"]

        resources {
          limits = {
            cpu    = "1"
            memory = "512Mi"
          }
        }

        # Inherit the same environment variables as the service
        env {
          name  = "APP_ENV"
          value = var.app_env
        }
        env {
          name  = "DB_CONNECTION"
          value = "mysql"
        }
        env {
          name  = "DB_SOCKET"
          value = local.db_socket_path
        }
        env {
          name  = "DB_DATABASE"
          value = var.db_name
        }
        env {
          name  = "DB_USERNAME"
          value = var.db_user
        }
        env {
          name  = "FILESYSTEM_DISK"
          value = "gcs"
        }
        env {
          name  = "GOOGLE_CLOUD_STORAGE_BUCKET"
          value = google_storage_bucket.laravel_storage.name
        }
        env {
          name  = "GOOGLE_CLOUD_PROJECT_ID"
          value = var.project_id
        }
        env {
          name = "APP_KEY"
          value_source {
            secret_key_ref {
              secret  = google_secret_manager_secret.app_key.secret_id
              version = "latest"
            }
          }
        }
        env {
          name = "DB_PASSWORD"
          value_source {
            secret_key_ref {
              secret  = google_secret_manager_secret.db_password.secret_id
              version = "latest"
            }
          }
        }

        volume_mounts {
          name       = "cloudsql"
          mount_path = "/cloudsql"
        }
      }

      max_retries = 1
    }
  }

  # Image is updated by GitHub Actions on each deploy
  lifecycle {
    ignore_changes = [
      template[0].template[0].containers[0].image,
      template[0].labels,
      client,
      client_version,
    ]
  }

  depends_on = [
    google_project_iam_member.cloud_run_roles,
    google_sql_database_instance.mysql,
    google_secret_manager_secret.app_key,
    google_secret_manager_secret.db_password,
  ]
}
