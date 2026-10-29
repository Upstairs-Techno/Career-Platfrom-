# Vercel + Supabase Migration Guide

## Current implementation status

The Vite frontend now calls the existing Supabase Edge Functions for application
submissions, referral validation and administration. The Spring Boot source is
retained for rollback until Supabase data and account access are verified. No
production database, Supabase project, AWS resource, or Vercel project was
changed during local implementation.

| Existing capability | Supabase implementation |
| --- | --- |
| OJT / internship program metadata | Static values from the current Java enums, served by frontend service modules |
| Submit OJT / internship application | `submit-application?type=ojt` / `?type=internship`, with the existing transaction RPCs |
| Referral validation | `validate-referral` Edge Function |
| Admin login using the existing login ID | New `admin-login` Edge Function resolves the login ID server-side and authenticates through Supabase Auth |
| Admin profile and active-account check | New `admin-profile` Edge Function and shared `requireAdmin()` check |
| Admin dashboard counts | `get-dashboard-stats` -> `get_dashboard_statistics()` |
| Filtered application lists | `list-applications?type=...` |
| Application details and status history | `get-application-detail?id=...` |
| Status changes and email notifications | `update-application-status?id=...` plus an atomic SQL update/history function |
| Referral code administration | `manage-referrals` Edge Function |
| CSV exports | `export-applications-csv?type=...` |
| Private resume viewing / download | `get-admin-resume-url?id=...`; a new migration locks the `resumes` bucket to server-side access |
| Email | Existing Edge Function email module uses Resend; delivery remains disabled without `RESEND_API_KEY` |

The old public application-by-ID endpoints are not connected to a frontend
route. They returned full applicant details using a sequential application ID,
which is not a safe authorization token. The admin-only detail Edge Function
remains available. If applicants need a tracking page, add a verified email or
random tracking-token flow before exposing application data publicly.

## Supabase review findings and limits

The local SQL describes `admins`, `students`, `referral_codes`, both application
tables, status history, and documents, plus submission and dashboard functions.
The RLS migration enables RLS and grants no direct browser access to those
tables. Admin Edge Functions validate Supabase Auth sessions and require an
active `admins.supabase_user_id` mapping before using the service-role client.
Resume access is also performed through Edge Functions, not browser Storage
policies.

The new forward migration revokes direct execution of privileged RPCs, sets a
fixed search path on the security-definer dashboard function, provisions a
private 5 MB resume bucket, blocks direct browser access to that bucket, and
adds an atomic application-status/history update. It has **not** been run.

The remote project could not be inspected from this workspace. In particular,
we do not know whether its migration history matches these files, whether any
tables or policies already exist, whether the bucket contains files, or whether
production records conflict with the migration. The first two migration files
use 8-digit prefixes; compare their versions with the remote migration history
before changing names or running `db push`.

## Required remote inspection and data safety

1. In Supabase Dashboard, open project `rjsygmzalkakslrigcck` and check **Database
   > Migrations** (or the `supabase_migrations.schema_migrations` history),
   **Table Editor**, **Authentication > Users**, **Storage > Buckets**, and
   **Edge Functions**. Confirm the schema and function deployments match local
   files. Do not use `db reset` on the production project.
2. With approved CLI access, run `npx supabase login`, then
   `npx supabase link --project-ref rjsygmzalkakslrigcck` and
   `npx supabase migration list`. Use `npx supabase db pull` to capture remote
   schema drift before deciding which migrations are safe. These commands have
   not been run here.
3. Back up the source PostgreSQL database with a custom-format `pg_dump`, and
   separately export the target Supabase database before applying any schema
   changes. Keep dumps outside the repository; `.gitignore` now excludes common
   dump formats. Record source and target row counts for students, referrals,
   OJT/internship applications, status history, and documents.
4. Inventory source resume files and Supabase Storage objects. Back up both,
   preserve application IDs, and prepare an explicit old-path to new-object-path
   manifest. Never infer that a file migration succeeded from database rows
   alone.
5. Rehearse schema and data migration against a disposable staging database.
   Compare row counts, primary/foreign-key relationships, status history, and
   resume checksums before considering production cutover.
6. Keep AWS database, files, and services available during cutover. Roll back
   by directing traffic to the previous frontend/backend and restoring the
   pre-migration Supabase backup only if required. Do not delete or terminate
   AWS resources without separate approval.

The existing initial SQL uses `CREATE DOMAIN` and `CREATE TRIGGER` statements
that are not repeatable on a partially initialized schema. It also uses
`CREATE TABLE IF NOT EXISTS`, which does not add missing columns to an existing
table. Reconcile the remote schema and migration history first; do not blindly
replay those files over existing data.

## Admin account setup

The frontend preserves login-ID entry. The `admin-login` Edge Function finds
the active admin row by login ID, then asks Supabase Auth to verify the password
against `admins.email`. It returns a user session only if its Auth user ID also
matches `admins.supabase_user_id`. No role or session value in browser storage
is used as authorization evidence; protected functions verify the JWT and
active admin row on every request.

Before the admin portal can work, create/confirm each administrator in
**Authentication > Users**, ensure the Auth email matches `admins.email`, and
link that Auth UUID to `admins.supabase_user_id`. Keep `login_id`, `role`, and
`active` values intact. The old application stores BCrypt hashes in Spring's
admin table; this frontend does not read or transfer those hashes. Admins need
valid Supabase Auth credentials (for example, an invitation/password reset)
unless a separately reviewed supported password-hash import is performed.
The remote admin rows and Auth users were unavailable for verification.

## Company application notifications

OJT and Internship submissions run through the Supabase Edge Function, which
already uses Resend for applicant confirmation emails. Company notifications
reuse that Resend API integration; SMTP credentials are not used by this
production request path. A database trigger writes one event to
`application_notification_outbox` in the same transaction that assigns the
final application ID. The submit function attempts immediate delivery. Failed
events stay pending with exponential backoff, and the protected
`dispatch-application-notifications` function can drain them later. The
outbox and Resend idempotency key prevent duplicate notifications on retries.

Configure these Supabase Edge Function secrets in the Dashboard's Edge
Function Secrets (or use an ignored local env file based on
`supabase/functions/.env.example`):

- `RESEND_API_KEY`: a Resend API key; this is currently absent from the linked
  project and must be configured before notifications can be sent.
- `APP_EMAIL_FROM`: a sender address verified with the existing Resend account.
- `APPLICATION_NOTIFICATION_EMAIL`: `contact@upstairstechno.com`.
- `APPLICATION_NOTIFICATION_WORKER_TOKEN`: a long random token used only to
  authorize scheduled calls to the retry worker.

No SMTP host or mailbox password is required. Delivery uses the existing
Resend HTTP API. The email includes the applicant's name, email, phone, program
and track/domain title, application ID, and submission time. This platform
does not have a separate jobs table or job ID. Resume links are omitted; staff
must open documents through the authenticated admin portal.

For automatic retries while no new application is being submitted, schedule
an authenticated POST to
`https://<project-ref>.supabase.co/functions/v1/dispatch-application-notifications`
using the project's publishable key in the `apikey` header, and
`APPLICATION_NOTIFICATION_WORKER_TOKEN` in the
`x-notification-worker-token` header. Store both values in the scheduler's
secret store; do not put either in source code, a browser bundle, or a
committed cron definition. The worker processes up to 20 due events per call.

## Edge Function deployment

The checked-in `supabase/config.toml` disables the gateway JWT pre-check so the
functions can receive the browser's publishable key and enforce access in the
handler. Public submission/validation handlers validate their inputs. Protected
handlers call `requireAdmin()`, which validates the user JWT with Supabase Auth
and checks the active admin mapping before using the service-role client.
Review this configuration before deploying; never remove the handler-level
checks or expose the service-role/secret key.

After remote schema inspection and migrations are complete, deploy the listed
Edge Functions with the Supabase CLI. Configure `RESEND_API_KEY` and
`APP_EMAIL_FROM` through Supabase's Edge Function secrets if email delivery is
required. Set `ALLOWED_ORIGIN` to the production website origin (and any approved
preview origin) using function secrets. Email delivery and unauthorized-access
checks have not been exercised against the remote project.

## Frontend and Vercel configuration

The frontend project root is `frontend/`. Build command: `npm run build`;
output directory: `dist`; SPA rewrites are already in `frontend/vercel.json`.
Configure these Vercel environment variables for Preview and Production:

```env
VITE_SUPABASE_URL=https://rjsygmzalkakslrigcck.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<project publishable key>
```

Only those public values belong in Vercel frontend build variables. Keep the
Supabase secret/service-role key, Resend key, and database credentials in
Supabase server-side secrets. Do not paste secret values into Git or this guide.

## Production cutover checklist

- [ ] Confirm target project schema and migration history; take source and target backups.
- [ ] Apply reviewed migrations in staging, validate data, then apply to production.
- [ ] Deploy Edge Functions and configure server-side secrets and CORS origins.
- [ ] Provision Supabase Auth users and verify admin UUID/role/active mappings.
- [ ] Set Vercel project root and environment variables; run production build.
- [ ] Verify anonymous submissions and referral validation; verify admin access and denial for non-admin users.
- [ ] Verify private resume upload, view, and download; test email delivery if configured.
- [ ] Verify all record/file counts and browser network requests.
- [ ] Switch production traffic only after verification; retain AWS rollback path.
- [ ] Ask before deleting or terminating any AWS resource.

## Source repository history

The original frontend and backend were separate repositories. The consolidated
repository contains the current working files but does not import either
nested `.git` directory or its history; both original repositories remain
available separately. The old tracked frontend `.env.production` file only
contained the retired API URL and is not included in this consolidated source.
The `.env.example` file contains placeholders only.
