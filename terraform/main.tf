# ============================================================
#  Flowki — GCP Infrastructure (PostgreSQL Version)
#  Target budget: ~$10 USD / month
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

  backend "gcs" {
    # bucket and prefix are supplied via -backend-config or terraform.tfvars
  }
}

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
    "cloudtasks.googleapis.com",
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

resource "google_service_account" "cloud_run" {
  project      = var.project_id
  account_id   = "${var.app_name}-run"
  display_name = "${var.app_name} Cloud Run Service Account"
}

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
  pool_id     = "github-actions-pool-v2"
  provider_id = "github-actions-provider-v2"

  depends_on = [
    google_project_service.apis,
    google_service_account.github_actions,
  ]
}

# ──────────────────────────────────────────────────────────────
# IAM — Service Account Roles
# ──────────────────────────────────────────────────────────────
locals {
  cloud_run_roles = [
    "roles/cloudsql.client",
    "roles/storage.objectAdmin",
    "roles/secretmanager.secretAccessor",
    "roles/cloudtasks.enqueuer",
  ]
  github_actions_roles = [
    "roles/run.developer",
    "roles/artifactregistry.writer",
    "roles/iam.serviceAccountUser",
    "roles/secretmanager.secretAccessor",
    "roles/run.invoker",
  ]
}

resource "google_project_iam_member" "cloud_run_roles" {
  for_each = toset(local.cloud_run_roles)
  project  = var.project_id
  role     = each.value
  member   = "serviceAccount:${google_service_account.cloud_run.email}"
}

resource "google_project_iam_member" "github_actions_roles" {
  for_each = toset(local.github_actions_roles)
  project  = var.project_id
  role     = each.value
  member   = "serviceAccount:${google_service_account.github_actions.email}"
}

# ──────────────────────────────────────────────────────────────
# Artifact Registry
# ──────────────────────────────────────────────────────────────
resource "google_artifact_registry_repository" "app" {
  project       = var.project_id
  location      = var.region
  repository_id = var.app_name
  format        = "DOCKER"
  depends_on    = [google_project_service.apis]
}

# ──────────────────────────────────────────────────────────────
# Cloud SQL (PostgreSQL)
# ──────────────────────────────────────────────────────────────
resource "random_id" "db_suffix" {
  byte_length = 4
}

resource "google_sql_database_instance" "postgres" {
  project          = var.project_id
  name             = "${var.app_name}-pg-${random_id.db_suffix.hex}"
  database_version = "POSTGRES_16"
  region           = var.region

  settings {
    tier              = "db-f1-micro"
    availability_type = "ZONAL"

    backup_configuration {
      enabled    = true
      start_time = "03:00"
    }

    ip_configuration {
      ipv4_enabled = true
      require_ssl  = true
    }

    database_flags {
      name  = "log_min_duration_statement"
      value = "2000"
    }
  }

  deletion_protection = false
  depends_on          = [google_project_service.apis]
}

resource "google_sql_database" "app" {
  project  = var.project_id
  instance = google_sql_database_instance.postgres.name
  name     = var.db_name
}

resource "random_password" "db_password" {
  length           = 32
  special          = true
  override_special = "!#$%&*-_=+?"
}

resource "google_sql_user" "app" {
  project  = var.project_id
  instance = google_sql_database_instance.postgres.name
  name     = var.db_user
  password = random_password.db_password.result
}

# ──────────────────────────────────────────────────────────────
# Secret Manager (Data Sources & Resources)
# ──────────────────────────────────────────────────────────────

data "google_secret_manager_secret" "app_key" {
  project   = var.project_id
  secret_id = "${var.app_name}-app-key"
}

data "google_secret_manager_secret" "cloudflare_api_token" {
  project   = var.project_id
  secret_id = "${var.app_name}-cloudflare-api-token"
}

data "google_secret_manager_secret" "mailgun_secret" {
  project   = var.project_id
  secret_id = "${var.app_name}-mailgun-secret"
}

data "google_secret_manager_secret" "google_client_secret" {
  project   = var.project_id
  secret_id = "${var.app_name}-google-client-secret"
}

data "google_secret_manager_secret" "gemini_api_key" {
  project   = var.project_id
  secret_id = "${var.app_name}-gemini-api-key"
}

data "google_secret_manager_secret" "anthropic_api_key" {
  project   = var.project_id
  secret_id = "${var.app_name}-anthropic-api-key"
}

data "google_secret_manager_secret" "firebase_private_key" {
  project   = var.project_id
  secret_id = "${var.app_name}-firebase-private-key"
}

resource "google_secret_manager_secret" "db_password" {
  project   = var.project_id
  secret_id = "${var.app_name}-db-password"
  replication {
    auto {}
  }
  depends_on = [google_project_service.apis]
}

resource "google_secret_manager_secret_version" "db_password_initial" {
  secret      = google_secret_manager_secret.db_password.id
  secret_data = random_password.db_password.result
}

# ──────────────────────────────────────────────────────────────
# GCS Bucket
# ──────────────────────────────────────────────────────────────
resource "google_storage_bucket" "laravel_storage" {
  project                     = var.project_id
  name                        = "${var.app_name}-${var.app_env}-storage"
  location                    = var.region
  uniform_bucket_level_access = true
  depends_on                  = [google_project_service.apis]
}

# ──────────────────────────────────────────────────────────────
# Cloud Tasks Queue
# ──────────────────────────────────────────────────────────────
resource "google_cloud_tasks_queue" "default" {
  project  = var.project_id
  name     = "${var.app_name}-default"
  location = var.region

  retry_config {
    max_attempts  = 10
    min_backoff   = "5s"
    max_backoff   = "600s"
    max_doublings = 5
  }

  depends_on = [google_project_service.apis]
}

# ──────────────────────────────────────────────────────────────
# Cloud Run Configuration Helpers
# ──────────────────────────────────────────────────────────────
locals {
  cloud_sql_connection = "${var.project_id}:${var.region}:${google_sql_database_instance.postgres.name}"
  db_socket_path       = "/cloudsql/${local.cloud_sql_connection}"
  #image_placeholder    = "${var.region}-docker.pkg.dev/${var.project_id}/${var.app_name}/${var.app_name}:latest"
  image_placeholder    = "us-docker.pkg.dev/cloudrun/container/hello"
}

# ──────────────────────────────────────────────────────────────
# Cloud Run Service — Application
# ──────────────────────────────────────────────────────────────
resource "google_cloud_run_v2_service" "app" {
  project  = var.project_id
  name     = var.app_name
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    service_account = google_service_account.cloud_run.email

    scaling {
      min_instance_count = var.cloud_run_min_instances
      max_instance_count = var.cloud_run_max_instances
    }

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
        cpu_idle = true
      }

      dynamic "env" {
        for_each = local.app_env_vars
        content {
          name  = env.key
          value = env.value
        }
      }

      env {
        name = "APP_KEY"
        value_source {
          secret_key_ref {
            secret  = data.google_secret_manager_secret.app_key.secret_id
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
            secret  = data.google_secret_manager_secret.cloudflare_api_token.secret_id
            version = "latest"
          }
        }
      }
      env {
        name = "MAILGUN_SECRET"
        value_source {
          secret_key_ref {
            secret  = data.google_secret_manager_secret.mailgun_secret.secret_id
            version = "latest"
          }
        }
      }
      env {
        name = "GOOGLE_CLIENT_SECRET"
        value_source {
          secret_key_ref {
            secret  = data.google_secret_manager_secret.google_client_secret.secret_id
            version = "latest"
          }
        }
      }
      env {
        name = "GEMINI_API_KEY"
        value_source {
          secret_key_ref {
            secret  = data.google_secret_manager_secret.gemini_api_key.secret_id
            version = "latest"
          }
        }
      }
      env {
        name = "ANTHROPIC_API_KEY"
        value_source {
          secret_key_ref {
            secret  = data.google_secret_manager_secret.anthropic_api_key.secret_id
            version = "latest"
          }
        }
      }
      env {
        name = "FIREBASE_PRIVATE_KEY"
        value_source {
          secret_key_ref {
            secret  = data.google_secret_manager_secret.firebase_private_key.secret_id
            version = "latest"
          }
        }
      }

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
      }
    }
  }

  lifecycle {
    ignore_changes = [
      template[0].containers[0].image,
      template[0].labels,
      template[0].revision
    ]
  }

  depends_on = [
    google_project_iam_member.cloud_run_roles,
    google_sql_database_instance.postgres
  ]
}

# Public access
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
        image   = local.image_placeholder
        command = ["php", "artisan", "migrate", "--force"]

        dynamic "env" {
          for_each = local.app_env_vars
          content {
            name  = env.key
            value = env.value
          }
        }

        env {
          name = "APP_KEY"
          value_source {
            secret_key_ref {
              secret  = data.google_secret_manager_secret.app_key.secret_id
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
    }
  }

  lifecycle {
    ignore_changes = [template[0].template[0].containers[0].image]
  }

  depends_on = [
    google_project_iam_member.cloud_run_roles,
    google_sql_database_instance.postgres
  ]
}