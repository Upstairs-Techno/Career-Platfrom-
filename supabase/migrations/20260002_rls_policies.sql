-- =============================================================================
-- Migration: 20260002_rls_policies.sql
-- Row Level Security policies for all tables.
-- All admin operations go through Edge Functions with service_role key (bypasses RLS).
-- Public operations are limited to minimum required data.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Enable RLS on ALL tables
-- ---------------------------------------------------------------------------
ALTER TABLE admins                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE students                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_codes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE ojt_applications         ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship_applications  ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents                ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- ADMINS TABLE
-- No direct client access. Managed only through Edge Functions (service_role).
-- ---------------------------------------------------------------------------
-- No public policies — default deny for all roles.

-- ---------------------------------------------------------------------------
-- STUDENTS TABLE
-- No direct public access. Only Edge Functions can insert/update students.
-- ---------------------------------------------------------------------------
-- No public policies.

-- ---------------------------------------------------------------------------
-- REFERRAL_CODES TABLE
-- Public: can only call validate via Edge Function (no direct table access).
-- No direct RLS policy needed — validation goes through Edge Function.
-- ---------------------------------------------------------------------------
-- No public policies.

-- ---------------------------------------------------------------------------
-- OJT_APPLICATIONS TABLE
-- Public: Can SELECT own application status using the application_id token.
-- This exposes ONLY the status field for a specific application_id.
-- No enumeration possible — requires exact application_id.
-- ---------------------------------------------------------------------------
CREATE POLICY "public_read_own_ojt_application"
  ON ojt_applications
  FOR SELECT
  TO anon
  USING (FALSE);  -- Disabled: use Edge Function for public tracking instead

-- Admin: No direct access — all admin queries go through service_role Edge Functions.
-- anon INSERT blocked: submissions go through submit-application Edge Function.

-- ---------------------------------------------------------------------------
-- INTERNSHIP_APPLICATIONS TABLE
-- Same as OJT — no direct public access.
-- ---------------------------------------------------------------------------
-- Default deny.

-- ---------------------------------------------------------------------------
-- APPLICATION_STATUS_HISTORY
-- No public access.
-- ---------------------------------------------------------------------------
-- Default deny.

-- ---------------------------------------------------------------------------
-- DOCUMENTS TABLE
-- No public access.
-- ---------------------------------------------------------------------------
-- Default deny.

-- ---------------------------------------------------------------------------
-- NOTE ON EDGE FUNCTIONS:
-- All Edge Functions that need admin-level access use the Supabase SERVICE_ROLE key
-- which bypasses RLS entirely. These functions perform their own authorization:
--   1. Verify the caller has a valid Supabase Auth JWT
--   2. Look up the caller's supabase_user_id in the admins table (active=true)
--   3. Only then execute the privileged query
-- Public Edge Functions (submit-application, validate-referral) use service_role
-- internally but do NOT require caller authentication — they apply their own
-- rate limiting and validation logic.
-- ---------------------------------------------------------------------------
