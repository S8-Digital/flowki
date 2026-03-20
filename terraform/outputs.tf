output "cloud_run_url" {
  description = "The HTTPS URL of the Cloud Run service."
  value       = google_cloud_run_v2_service.app.uri
}

output "cloud_sql_connection_name" {
  description = "Cloud SQL instance connection name (PROJECT:REGION:INSTANCE)."
  value       = google_sql_database_instance.mysql.connection_name
}

output "artifact_registry_repository" {
  description = "Artifact Registry repository URI for Docker images."
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.app.repository_id}"
}

output "gcs_storage_bucket" {
  description = "Name of the GCS bucket used as Laravel's cloud disk."
  value       = google_storage_bucket.laravel_storage.name
}

output "workload_identity_provider" {
  description = "Full WIF provider name to use in the GitHub Actions workflow."
  value       = module.workload_identity.workload_identity_provider
}

output "github_actions_service_account" {
  description = "Email of the service account used by GitHub Actions."
  value       = google_service_account.github_actions.email
}

output "cloud_run_service_account" {
  description = "Email of the service account used by Cloud Run."
  value       = google_service_account.cloud_run.email
}
