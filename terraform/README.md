# Flowki — Terraform Infrastructure

This directory manages all GCP infrastructure for Flowki using Terraform. State is stored remotely in a GCS bucket — **never** committed to git.

---

## Prerequisites

- [Terraform](https://developer.hashicorp.com/terraform/install) `>= 1.5`
- [Google Cloud SDK (`gcloud`)](https://cloud.google.com/sdk/docs/install)
- Access to the `flowki-490210` GCP project

---

## 1. Authenticate with Google Cloud

You need two credentials: **Application Default Credentials (ADC)** for Terraform's Google provider, and gcloud login for your own CLI use.

```bash
# Log in to gcloud CLI
gcloud auth login

# Set up Application Default Credentials (used by Terraform)
gcloud auth application-default login

# Set the active project
gcloud config set project flowki-490210
```

> **Note:** If you see `Error: google: could not find default credentials`, re-run the `application-default login` command above.

---

## 2. Recovering Lost Terraform State

The Terraform state is **not** stored locally — it lives in a GCS bucket:

- **Bucket:** `414442590715-tfstate`
- **Project:** `flowki-490210`

When you lose your local `.terraform/` directory (or clone the repo fresh), you just need to re-initialise. Terraform will automatically pull the existing state from GCS.

```bash
cd terraform

terraform init \
  -backend-config="bucket=414442590715-tfstate" \
  -backend-config="prefix=terraform/state"
```

After this completes, run `terraform plan` — if it shows **no changes**, your local environment is fully in sync with the real infrastructure.

> **If `terraform init` fails with a permissions error**, ensure your account has the `roles/storage.objectAdmin` or `roles/storage.admin` IAM role on the `414442590715-tfstate` bucket, or ask the project owner to grant it.

---

## 3. Initialise Terraform (fresh clone / new machine)

```bash
cd terraform

terraform init \
  -backend-config="bucket=414442590715-tfstate" \
  -backend-config="prefix=terraform/state"
```

---

## 4. Plan Changes

Preview what Terraform will create, update, or destroy before applying:

```bash
terraform plan
```

To save the plan to a file (recommended for production applies):

```bash
terraform plan -out=tfplan
terraform apply tfplan
```

---

## 5. Apply Changes

```bash
terraform apply
```

Terraform will show you a diff and ask for confirmation before making any changes. Type `yes` to proceed.

### First Apply (brand-new infrastructure)

On the very first `apply` the Cloud Run service is provisioned with a placeholder image (`us-docker.pkg.dev/cloudrun/container/hello`). Once CI/CD has pushed the real image and deployed it, record the Cloud Run URL and set it in `terraform.tfvars`:

```hcl
cloud_run_url = "https://flowki-<hash>-ue.a.run.app"
```

Then re-apply so Cloud Tasks bypasses Cloudflare for internal job delivery:

```bash
terraform apply
```

---

## 6. Useful Commands

| Command | Description |
|---|---|
| `terraform init` | Initialise providers & backend |
| `terraform plan` | Preview changes |
| `terraform apply` | Apply changes |
| `terraform output` | Print all output values |
| `terraform output cloud_run_url` | Print the Cloud Run service URL |
| `terraform output workload_identity_provider` | Print the WIF provider (used in GitHub Actions) |
| `terraform state list` | List all resources in state |
| `terraform state show <resource>` | Show details of a specific resource |
| `terraform refresh` | Sync state with actual GCP resources |
| `terraform destroy` | **Destroy all infrastructure** (use with extreme caution) |

---

## 7. Key Outputs

After `terraform apply` or `terraform output`:

| Output | Description |
|---|---|
| `cloud_run_url` | HTTPS URL of the Cloud Run service |
| `cloud_sql_connection_name` | Cloud SQL connection name (`PROJECT:REGION:INSTANCE`) |
| `artifact_registry_repository` | Docker image URI for CI/CD pushes |
| `gcs_storage_bucket` | GCS bucket used as Laravel's `cloud` disk |
| `workload_identity_provider` | WIF provider name for GitHub Actions OIDC auth |
| `github_actions_service_account` | Service account email for GitHub Actions |
| `cloud_run_service_account` | Service account email for Cloud Run |
| `cloud_tasks_queue` | Cloud Tasks queue name |

---

## 8. Secret Manager Secrets

The following secrets must exist in Secret Manager **before** running `terraform apply` (they are referenced as `data` sources, not created by Terraform):

| Secret ID | Description |
|---|---|
| `flowki-app-key` | Laravel `APP_KEY` |
| `flowki-cloudflare-api-token` | Cloudflare API token |
| `flowki-cloudflare-worker-secret` | Cloudflare Worker shared secret |
| `flowki-mailgun-secret` | Mailgun API secret |
| `flowki-google-client-secret` | Google OAuth client secret |
| `flowki-gemini-api-key` | Gemini API key |
| `flowki-anthropic-api-key` | Anthropic API key |
| `flowki-firebase-private-key` | Firebase Admin SDK private key |

To create a missing secret:

```bash
echo -n "SECRET_VALUE" | gcloud secrets create flowki-app-key \
  --project=flowki-490210 \
  --replication-policy=automatic \
  --data-file=-
```

To add a new version to an existing secret:

```bash
echo -n "NEW_VALUE" | gcloud secrets versions add flowki-app-key \
  --project=flowki-490210 \
  --data-file=-
```

---

## 9. Module: Workload Identity Federation

The `modules/workload_identity` module configures GitHub Actions to authenticate with GCP via OIDC (no long-lived service account keys). The pool is `github-actions-pool-v2` and the provider is `github-actions-provider-v2`.

After apply, copy the `workload_identity_provider` and `github_actions_service_account` outputs into the repository's GitHub Actions secrets:

- `GCP_WORKLOAD_IDENTITY_PROVIDER` → value of `workload_identity_provider`
- `GCP_SERVICE_ACCOUNT` → value of `github_actions_service_account`

---

## 10. Gitignored Files

The following files are intentionally excluded from version control:

```
.terraform/          # Provider binaries & backend config cache
*.tfstate            # Local state (not used — state lives in GCS)
*.tfstate.backup
.terraform.lock.hcl  # Lock file (re-generated on init)
```

These are all recoverable by re-running `terraform init` as described in [§2](#2-recovering-lost-terraform-state) and [§3](#3-initialise-terraform-fresh-clone--new-machine).

