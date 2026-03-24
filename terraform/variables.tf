variable "project_id" {
  description = "GCP project ID."
  type        = string
}

variable "region" {
  description = "GCP region for all resources."
  type        = string
  default     = "us-east1"
}

variable "app_name" {
  description = "Short application name used as a naming prefix (lowercase, hyphens only)."
  type        = string
  default     = "flowki"
}

variable "app_env" {
  description = "Laravel APP_ENV value (e.g. production, staging)."
  type        = string
  default     = "production"
}

variable "app_timezone" {
  description = "Laravel APP_TIMEZONE value."
  type        = string
  default     = "Australia/Sydney"
}

variable "app_url" {
  description = "Public URL of the application (e.g. https://flowki.family)."
  type        = string
}

variable "github_org" {
  description = "GitHub organisation (or username) that owns the repository."
  type        = string
  default     = "S8-Digital"
}

variable "github_repo" {
  description = "GitHub repository name (without the org prefix)."
  type        = string
  default     = "flowki"
}

variable "cloudflare_api_token" {
  description = "Cloudflare API Token (stored in Secret Manager as CLOUDFLARE_API_TOKEN)."
  type        = string
  sensitive   = true
  default     = ""
}

variable "terraform_state_bucket" {
  description = "Name of the GCS bucket used to store Terraform remote state."
  type        = string
}

variable "db_name" {
  description = "Name of the MySQL database to create inside Cloud SQL."
  type        = string
  default     = "flowki"
}

variable "db_user" {
  description = "MySQL database username."
  type        = string
  default     = "flowki"
}

variable "cloud_run_min_instances" {
  description = "Minimum number of Cloud Run instances (0 = scale to zero)."
  type        = number
  default     = 0
}

variable "cloud_run_max_instances" {
  description = "Maximum number of Cloud Run instances."
  type        = number
  default     = 3
}

variable "cloud_run_cpu" {
  description = "CPU limit for each Cloud Run instance (e.g. '1')."
  type        = string
  default     = "1"
}

variable "cloud_run_memory" {
  description = "Memory limit for each Cloud Run instance (e.g. '512Mi')."
  type        = string
  default     = "512Mi"
}

variable "cloud_run_concurrency" {
  description = "Maximum number of concurrent requests per Cloud Run instance."
  type        = number
  default     = 80
}
