# Upstairs Techno Career Platform — Frontend

React 18 + Vite frontend. Public application submissions, referral validation,
admin operations, and protected resume access use the Supabase Edge Functions
in the sibling `supabase/` directory. No Spring Boot process is used by Vite.

## Local development

1. Install Node.js 20 or newer.
2. Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_PUBLISHABLE_KEY`
   to the project's publishable key. The Supabase URL is already provided.
3. Run `npm install`, then `npm run dev`.

The publishable key is intended for browser use. Never put the Supabase secret
or service-role key, database password, or email provider key in a `VITE_*`
variable. Those secrets belong in Supabase Edge Function secrets.

## Supabase setup

The migrations and Edge Functions are in `../supabase`. Review the target
project's migration history and schema before applying migrations. See
`../MIGRATION_GUIDE.md` for the safe inspection, backup, apply, and rollback
sequence. Edge Functions must be deployed after the migrations. Admin accounts
must have a Supabase Auth user whose UUID matches `admins.supabase_user_id` and
whose email matches `admins.email`.

## Vercel

Import the frontend directory as the Vercel project root. Use `npm run build`
and output directory `dist`. Configure `VITE_SUPABASE_URL` and
`VITE_SUPABASE_PUBLISHABLE_KEY` in Vercel for each deployment environment.
`vercel.json` provides SPA routing and response headers.
