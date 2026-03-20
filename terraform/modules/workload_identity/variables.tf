variable "project_id" {
  description = "The GCP project ID."
  type        = string
}

variable "pool_id" {
  description = "The ID for the Workload Identity Pool."
  type        = string
  default     = "github-actions-pool"
}

variable "pool_display_name" {
  description = "Display name for the Workload Identity Pool."
  type        = string
  default     = "GitHub Actions Pool"
}

variable "provider_id" {
  description = "The ID for the Workload Identity Pool Provider."
  type        = string
  default     = "github-actions-provider"
}

variable "provider_display_name" {
  description = "Display name for the Workload Identity Pool Provider."
  type        = string
  default     = "GitHub Actions OIDC Provider"
}

variable "github_org" {
  description = "The GitHub organisation (or username) that owns the repository."
  type        = string
}

variable "github_repo" {
  description = "The GitHub repository name (without the org prefix)."
  type        = string
}

variable "service_account_id" {
  description = "The ID of the service account that GitHub Actions will impersonate."
  type        = string
}
