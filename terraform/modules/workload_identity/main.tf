# ---------------------------------------------------------------
# Workload Identity Federation — GitHub Actions ↔ GCP
# ---------------------------------------------------------------
# Creates a WIF Pool + OIDC Provider so GitHub Actions workflows
# can authenticate to GCP without long-lived service-account keys.
# Tokens are scoped to the specific GitHub org/repo and never
# granted to arbitrary actors.
# ---------------------------------------------------------------

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 5.0"
    }
  }
}

# ------------------------------------------------------------------
# 1. Workload Identity Pool
# ------------------------------------------------------------------
resource "google_iam_workload_identity_pool" "github" {
  project                   = var.project_id
  workload_identity_pool_id = var.pool_id
  display_name              = var.pool_display_name
  description               = "Pool for GitHub Actions OIDC tokens"
  disabled                  = false
}

# ------------------------------------------------------------------
# 2. OIDC Provider (GitHub's public JWKS endpoint)
# ------------------------------------------------------------------
resource "google_iam_workload_identity_pool_provider" "github_oidc" {
  project                            = var.project_id
  workload_identity_pool_id          = google_iam_workload_identity_pool.github.workload_identity_pool_id
  workload_identity_pool_provider_id = var.provider_id
  display_name                       = var.provider_display_name
  description                        = "GitHub Actions OIDC provider"
  disabled                           = false

  # GitHub's OIDC issuer URI (no trailing slash)
  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }

  # Attribute mapping: project GitHub's OIDC claims onto Google attributes.
  # Only the sub, repository and repository_owner claims are mapped here;
  # additional claims can be added as needed.
  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.actor"      = "assertion.actor"
    "attribute.repository" = "assertion.repository"
    "attribute.ref"        = "assertion.ref"
  }

  # Restrict token exchange to a single GitHub repository so that
  # only workflows running in that repo can obtain GCP credentials.
  attribute_condition = "assertion.repository == '${var.github_org}/${var.github_repo}'"
}

# ------------------------------------------------------------------
# 3. Allow WIF-authenticated GitHub tokens to impersonate the SA.
#    The principal matches tokens whose `repository` attribute
#    equals "<org>/<repo>", ensuring only that repo can impersonate.
# ------------------------------------------------------------------
resource "google_service_account_iam_member" "wif_impersonation" {
  service_account_id = "projects/${var.project_id}/serviceAccounts/${var.service_account_id}@${var.project_id}.iam.gserviceaccount.com"
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github.name}/attribute.repository/${var.github_org}/${var.github_repo}"
}
