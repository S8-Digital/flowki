# Flowki

A family management application built with Laravel 12, a React/Inertia web app, and an Expo mobile app.

---

## Project Structure

```
flowki/
├── app/                     # Laravel PHP backend
├── resources/js/            # Web frontend (React + Inertia + MUI)
├── mobile/                  # Expo/React Native mobile app
├── shared/                  # Shared cross-platform TypeScript (types, hooks)
├── routes/
│   ├── web.php              # Web routes
│   ├── mobile.php           # Mobile API routes (/api/mobile/*)
│   └── ...
└── ...
```

### Shared Workspace (`shared/`)

Cross-platform logic re-used by both the web and mobile apps:

| File | Purpose |
|------|---------|
| `shared/src/types/index.ts` | Domain types (User, Family, Todo, Chore, etc.) |
| `shared/src/hooks/useRtdb.ts` | Firebase RTDB hook (platform-agnostic, firebase fns injected) |

---

## Development Setup

### Prerequisites

- Node.js 22+, PHP 8.5+, Composer, Docker (for Sail)

### 1. Install all dependencies

```bash
npm install        # installs root, mobile, and shared workspaces
composer install
```

### 2. Backend (Laravel via Sail)

```bash
cp .env.example .env
vendor/bin/sail up -d
vendor/bin/sail artisan key:generate
vendor/bin/sail artisan migrate --seed
```

### 3. Web frontend

```bash
npm run dev        # Vite dev server
```

### 4. Mobile app (Expo)

```bash
cp mobile/.env.example mobile/.env   # fill in EXPO_PUBLIC_* vars
cd mobile && npm start               # or npx expo start
```

---

## Testing

### Web frontend (Vitest)

```bash
# Run all web tests (single pass)
npm run test

# Watch mode
npm run test:watch
```

Configuration: `vitest.config.ts` — environment: `jsdom`, setup: `resources/js/tests/setup.ts`.

### Mobile (Vitest + @testing-library/react)

```bash
# Run all mobile tests (single pass)
cd mobile && npm test

# Watch mode
cd mobile && npm run test:watch

# Single file
cd mobile && npx vitest run __tests__/useRtdb.test.ts
```

Configuration: `mobile/vitest.config.ts` — environment: `jsdom`, setup: `mobile/vitest.setup.ts`.

**Important:** Global mocks (including `firebase/database`) are registered in `mobile/vitest.setup.ts`.
Per-file `vi.mock('firebase/database')` will **not** propagate to `@flowki/shared` modules — always add new shared-module mocks to the setup file.

### PHP (PHPUnit/paratest)

```bash
vendor/bin/sail artisan test --compact
# or parallel:
./vendor/bin/paratest --runner WrapperRunner --processes 12
```

### Lint & Format

```bash
# PHP
vendor/bin/pint

# TypeScript/TSX (ESLint + Prettier)
npm run lint
npm run format

# Type-check
npm run type-check
```

---

## GCP Deployment Guide

This project is deployed to Google Cloud Platform (GCP) using:

- **Terraform** for infrastructure as code
- **GitHub Actions** for CI/CD (keyless authentication via Workload Identity Federation)
- **Cloud Run** as the serverless compute platform
- **Cloud SQL (MySQL)** as the database
- **Cloud Storage (GCS)** as the Laravel cloud disk
- **Secret Manager** for sensitive configuration
- **Artifact Registry** for Docker images

---

### Prerequisites

- [Terraform](https://developer.hashicorp.com/terraform/downloads) ≥ 1.5
- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) (`gcloud`)
- A GCP project with billing enabled
- Owner or equivalent permissions on the GCP project

---

### 1. Bootstrap the Terraform Remote State Bucket

Terraform state must be stored remotely **before** running `terraform init`.
Create a GCS bucket manually using the `gcloud` CLI:

```bash
# Replace the values in angle brackets with your own
export PROJECT_ID="<your-gcp-project-id>"
export REGION="australia-southeast1"          # or your preferred region
export STATE_BUCKET="${PROJECT_ID}-tf-state"

# Create the bucket
gcloud storage buckets create "gs://${STATE_BUCKET}" \
  --project="${PROJECT_ID}" \
  --location="${REGION}" \
  --uniform-bucket-level-access

# Enable versioning so you can recover from accidental state deletion
gcloud storage buckets update "gs://${STATE_BUCKET}" \
  --versioning
```

Now initialise Terraform, pointing it at the bucket:

```bash
cd terraform/

terraform init \
  -backend-config="bucket=${STATE_BUCKET}" \
  -backend-config="prefix=terraform/state"
```

---

### 2. Create a `terraform.tfvars` file

```hcl
# terraform/terraform.tfvars  (do NOT commit this file)
project_id             = "<your-gcp-project-id>"
region                 = "australia-southeast1"
app_name               = "flowki"
app_url                = "https://flowki.family"
github_org             = "S8-Digital"
github_repo            = "flowki"
terraform_state_bucket = "<your-gcp-project-id>-tf-state"
```

---

### 3. Provision the Infrastructure

```bash
cd terraform/

terraform plan -out=tfplan
terraform apply tfplan
```

Terraform will output the values you need in the next step:

| Output | Description |
|--------|-------------|
| `workload_identity_provider` | Full WIF provider name |
| `github_actions_service_account` | Service account email for GitHub Actions |
| `cloud_run_url` | Public URL of the Cloud Run service |
| `artifact_registry_repository` | Docker image repository URI |

---

### 4. Populate Secret Manager Values

Terraform generates the database password automatically and stores it in Secret
Manager. You only need to populate the remaining two secrets manually:

```bash
export PROJECT_ID="<your-gcp-project-id>"
export APP_NAME="flowki"

# Generate a Laravel APP_KEY locally
APP_KEY=$(php artisan key:generate --show)

# APP_KEY
echo -n "${APP_KEY}" | \
  gcloud secrets versions add "${APP_NAME}-app-key" \
    --project="${PROJECT_ID}" \
    --data-file=-

# CLOUDFLARE_API_TOKEN
echo -n "<your-cloudflare-api-token>" | \
  gcloud secrets versions add "${APP_NAME}-cloudflare-api-token" \
    --project="${PROJECT_ID}" \
    --data-file=-
```

> **Note:** The `DB_PASSWORD` secret is populated automatically by Terraform
> using a `random_password` resource and stored in Secret Manager during
> provisioning. You do not need to set it manually.

---

### 5. Link the GitHub Repository to GCP Workload Identity Federation

After Terraform applies successfully, configure the following **GitHub Actions
variables** in your repository settings
(`Settings → Secrets and variables → Actions → Variables`):

| Variable | Value (from `terraform output`) |
|----------|---------------------------------|
| `GCP_PROJECT_ID` | Your GCP project ID |
| `GCP_REGION` | e.g. `australia-southeast1` |
| `APP_NAME` | `flowki` |
| `WIF_PROVIDER` | Value of `workload_identity_provider` output |
| `WIF_SERVICE_ACCOUNT` | Value of `github_actions_service_account` output |

No secrets (service account keys) are needed. The `google-github-actions/auth`
action uses the `id-token: write` permission to exchange a short-lived GitHub
OIDC token for a GCP access token via Workload Identity Federation.

The WIF provider is configured with an **attribute condition** that restricts
token exchange to workflows running inside the `S8-Digital/flowki` repository,
so no other repository can impersonate the service account.

---

### 6. First Deployment

Push to `main` (or trigger the workflow manually) to build and deploy:

```bash
git push origin main
```

The `deploy.yml` workflow will:

1. Build the Docker image and push it to Artifact Registry.
2. Update the `flowki-migrate` Cloud Run Job with the new image and execute
   `php artisan migrate --force`.
3. Deploy the new image to the `flowki` Cloud Run Service and shift 100%
   traffic to the latest revision.

---

### Mail Configuration

Flowki supports multiple mail drivers. By default, local development uses
[Mailpit](https://github.com/axllent/mailpit) (SMTP on port 1025) so you can
preview emails without sending them.

#### Switching to Mailgun

1. Add your Mailgun credentials to your environment (or GCP Secret Manager in
   production):

   ```env
   MAIL_MAILER=mailgun
   MAILGUN_DOMAIN=mg.yourdomain.com
   MAILGUN_SECRET=key-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
   # Use api.eu.mailgun.net for EU-hosted domains
   MAILGUN_ENDPOINT=api.mailgun.net
   ```

2. The `MAIL_FROM_ADDRESS` and `MAIL_FROM_NAME` variables still control the
   sender identity — ensure the address belongs to a domain verified in your
   Mailgun account.

3. No additional Laravel packages are required; Mailgun support is built into
   the `symfony/mailgun-mailer` package that ships with Laravel.

> **Tip:** To use the EU Mailgun region, set
> `MAILGUN_ENDPOINT=api.eu.mailgun.net`.

---

### Architecture Notes

- **Cloud SQL** is connected via Unix socket (`/cloudsql/PROJECT:REGION:INSTANCE`)
  using the built-in Cloud SQL Auth Proxy sidecar on Cloud Run.
- **Trusted Proxies** is set to `"*"` so Laravel correctly resolves real user
  IPs from `X-Forwarded-For` headers forwarded by Cloudflare and Google's GFE.
- All sensitive values (APP_KEY, DB_PASSWORD, CLOUDFLARE_API_TOKEN) are stored
  in Secret Manager and injected into Cloud Run at runtime — they are never
  stored in Terraform state or environment files.
- The Cloud Run service and migration job both use `lifecycle { ignore_changes }`
  for the container image so that Terraform re-runs don't revert deployments
  made by GitHub Actions.
