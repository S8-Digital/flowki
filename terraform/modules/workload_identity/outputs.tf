output "pool_name" {
  description = "Full resource name of the Workload Identity Pool."
  value       = google_iam_workload_identity_pool.github.name
}

output "provider_name" {
  description = "Full resource name of the Workload Identity Pool Provider."
  value       = google_iam_workload_identity_pool_provider.github_oidc.name
}

output "service_account_email" {
  description = "Email of the service account that GitHub Actions impersonates."
  value       = data.google_service_account.github_actions_sa.email
}

output "workload_identity_provider" {
  description = "The full provider resource name for use in the GitHub Actions workflow."
  value       = google_iam_workload_identity_pool_provider.github_oidc.name
}
