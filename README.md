# UPSTAIRS TECHNO — OJT & Internship Platform

**Learn • Build • Grow**

A React 18 + Vite public application website and admin dashboard. The target
architecture is Vercel for the frontend and Supabase for PostgreSQL, Auth,
Storage, and server-side Edge Functions.

> Migration status: the frontend has been connected locally to the existing
> Supabase Edge Function contracts and passes its lint and production build.
> Remote schema, production records, Auth accounts, file migration, and Vercel
> deployment still require access and verification. See [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md).

## Project structure

```text
frontend/       React + Vite application (Vercel project root)
supabase/       SQL migrations, Edge Functions, and project configuration
backend/        Retained Spring Boot source for reference and rollback until cutover is verified
design-system-export/  UI design tokens and component references
```

## Local frontend development

1. Install Node.js 20 or newer.
2. From `frontend/`, copy `.env.example` to `.env.local` and provide the project's
   Supabase publishable key. The project URL is already listed in the example.
3. Run `npm install`, then `npm run dev`.

The frontend uses only `VITE_SUPABASE_URL` and
`VITE_SUPABASE_PUBLISHABLE_KEY`. Never put a Supabase secret/service-role key,
email provider key, payment credential, or database password in a `VITE_*`
variable.

## Supabase setup

Review the remote migration history and schema before applying SQL. Do not reset
the production database. Back up the source and target data and rehearse the
migration before cutover. The exact inspection, data preservation, admin account,
function deployment, and rollback steps are in `MIGRATION_GUIDE.md`.

## Vercel deployment

Set `frontend/` as the project root, use `npm run build`, and publish `dist/`.
Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in Vercel for
Preview and Production. `frontend/vercel.json` contains the SPA rewrite and
response headers.

The frontend no longer calls the Spring API or an AWS API URL. Legacy backend
source remains only for rollback until the Supabase production migration is
verified; it is not required to build or run the frontend.
