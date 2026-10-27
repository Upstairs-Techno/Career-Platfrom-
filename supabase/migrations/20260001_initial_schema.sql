-- =============================================================================
-- Migration: 20260001_initial_schema.sql
-- Upstairs Career Platform — Full schema migration from Spring Boot JPA entities
-- Exact enum values, constraints, indexes, and FK relationships preserved.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- for gen_random_uuid()

-- ---------------------------------------------------------------------------
-- 1. ENUMS  (use TEXT CHECK constraints to allow future additions without
--            a full enum ALTER cycle; keeps values identical to Java enums)
-- ---------------------------------------------------------------------------

-- Application statuses — exact Java enum ApplicationStatus values
-- JOINED and IN_PROGRESS are present in frontend STATUS_LABELS — included.
CREATE DOMAIN application_status AS TEXT
  CHECK (VALUE IN (
    'SUBMITTED','UNDER_REVIEW','SELECTED','REJECTED',
    'JOINED','IN_PROGRESS','COMPLETED','CANCELLED'
  ));

-- OJT tracks — exact Java enum OjtTrack values
CREATE DOMAIN ojt_track AS TEXT
  CHECK (VALUE IN (
    'WEB_DEVELOPMENT','JAVA_DEVELOPMENT','PYTHON_AI',
    'CYBERSECURITY','AI_DATA_SCIENCE'
  ));

-- Internship domains — exact Java enum InternshipDomain values
CREATE DOMAIN internship_domain AS TEXT
  CHECK (VALUE IN (
    'WEB_DEVELOPMENT','JAVA_DEVELOPMENT','PYTHON_DEVELOPMENT',
    'AI_MACHINE_LEARNING','DATA_SCIENCE','CYBERSECURITY',
    'FULL_STACK_DEVELOPMENT'
  ));

-- Training modes — exact Java enum TrainingMode values
CREATE DOMAIN training_mode AS TEXT
  CHECK (VALUE IN ('ONLINE','OFFLINE'));

-- Gender — Java enum Gender values + PREFER_NOT_TO_SAY used in frontend
CREATE DOMAIN gender_value AS TEXT
  CHECK (VALUE IN ('MALE','FEMALE','OTHER','PREFER_NOT_TO_SAY'));

-- ---------------------------------------------------------------------------
-- 2. HELPER: updated_at trigger function
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- 3. admins table
-- Maps to: com.upstairstechno.entity.Admin
-- NOTE: This table stores Supabase Auth user IDs post-migration.
--       login_id kept for backward compat; supabase_user_id added for Auth.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
  id              BIGSERIAL     PRIMARY KEY,
  login_id        VARCHAR(100)  NOT NULL UNIQUE,
  password_hash   TEXT          NOT NULL DEFAULT '',  -- not used after Supabase Auth migration
  name            VARCHAR(150)  NOT NULL,
  email           VARCHAR(150)  UNIQUE,
  role            VARCHAR(50)   NOT NULL DEFAULT 'ADMIN',
  active          BOOLEAN       NOT NULL DEFAULT TRUE,
  supabase_user_id UUID         UNIQUE,               -- populated during admin migration
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TRIGGER admins_updated_at
  BEFORE UPDATE ON admins
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 4. students table
-- Maps to: com.upstairstechno.entity.Student
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS students (
  id          BIGSERIAL     PRIMARY KEY,
  name        VARCHAR(150)  NOT NULL,
  mobile      VARCHAR(20)   NOT NULL,
  email       VARCHAR(150)  NOT NULL,
  gender      gender_value,
  college     VARCHAR(200)  NOT NULL,
  course      VARCHAR(100)  NOT NULL,
  year        VARCHAR(50),
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_student_email  ON students(email);
CREATE INDEX idx_student_mobile ON students(mobile);

CREATE TRIGGER students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 5. referral_codes table
-- Maps to: com.upstairstechno.entity.ReferralCode
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS referral_codes (
  id            BIGSERIAL     PRIMARY KEY,
  code          VARCHAR(50)   NOT NULL UNIQUE,
  member_name   VARCHAR(150),
  mobile_number VARCHAR(25),
  email         VARCHAR(150),
  gender        VARCHAR(20),
  description   VARCHAR(500),
  max_uses      INTEGER       NOT NULL DEFAULT 100,
  used_count    INTEGER       NOT NULL DEFAULT 0,
  expires_at    TIMESTAMPTZ,
  active        BOOLEAN       NOT NULL DEFAULT TRUE,
  created_by    VARCHAR(100),
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_max_uses_positive CHECK (max_uses > 0),
  CONSTRAINT chk_used_count_non_negative CHECK (used_count >= 0)
);

CREATE INDEX idx_referral_code_code ON referral_codes(LOWER(code));

CREATE TRIGGER referral_codes_updated_at
  BEFORE UPDATE ON referral_codes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 6. ojt_applications table
-- Maps to: com.upstairstechno.entity.OjtApplication
-- application_id format: OJT-{YEAR}-{5-digit-seq}  e.g. OJT-2026-00001
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ojt_applications (
  id                    BIGSERIAL           PRIMARY KEY,
  application_id        VARCHAR(30)         NOT NULL UNIQUE,
  student_id            BIGINT              NOT NULL REFERENCES students(id),
  duration_weeks        INTEGER             NOT NULL,
  training_mode         training_mode       NOT NULL,
  track                 ojt_track           NOT NULL,
  referral_code_id      BIGINT              REFERENCES referral_codes(id),
  status                application_status  NOT NULL DEFAULT 'SUBMITTED',
  remarks               VARCHAR(1000),
  -- Resume stored in Supabase Storage; path = storage object key
  resume_path           VARCHAR(500),
  resume_file_name      VARCHAR(255),
  resume_content_type   VARCHAR(100),
  resume_file_size      BIGINT,
  created_at            TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_ojt_duration CHECK (duration_weeks IN (4, 6, 8, 12))
);

CREATE INDEX idx_ojt_status     ON ojt_applications(status);
CREATE INDEX idx_ojt_student_id ON ojt_applications(student_id);
CREATE INDEX idx_ojt_referral   ON ojt_applications(referral_code_id);

CREATE TRIGGER ojt_applications_updated_at
  BEFORE UPDATE ON ojt_applications
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 7. internship_applications table
-- Maps to: com.upstairstechno.entity.InternshipApplication
-- application_id format: INT-{YEAR}-{5-digit-seq}  e.g. INT-2026-00001
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS internship_applications (
  id                    BIGSERIAL           PRIMARY KEY,
  application_id        VARCHAR(30)         NOT NULL UNIQUE,
  student_id            BIGINT              NOT NULL REFERENCES students(id),
  duration_months       INTEGER             NOT NULL,
  mode                  training_mode       NOT NULL,
  domain                internship_domain   NOT NULL,
  referral_code_id      BIGINT              REFERENCES referral_codes(id),
  status                application_status  NOT NULL DEFAULT 'SUBMITTED',
  remarks               VARCHAR(1000),
  resume_path           VARCHAR(500),
  resume_file_name      VARCHAR(255),
  resume_content_type   VARCHAR(100),
  resume_file_size      BIGINT,
  created_at            TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_internship_duration CHECK (duration_months IN (1, 2, 3, 6))
);

CREATE INDEX idx_internship_status     ON internship_applications(status);
CREATE INDEX idx_internship_student_id ON internship_applications(student_id);
CREATE INDEX idx_internship_referral   ON internship_applications(referral_code_id);

CREATE TRIGGER internship_applications_updated_at
  BEFORE UPDATE ON internship_applications
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 8. application_status_history table
-- Maps to: com.upstairstechno.entity.ApplicationStatusHistory
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS application_status_history (
  id                BIGSERIAL           PRIMARY KEY,
  application_type  VARCHAR(20)         NOT NULL CHECK (application_type IN ('OJT','INTERNSHIP')),
  application_id    VARCHAR(30)         NOT NULL,
  old_status        application_status,
  new_status        application_status  NOT NULL,
  remarks           VARCHAR(1000),
  changed_by        VARCHAR(100),
  changed_at        TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_history_app ON application_status_history(application_type, application_id);

-- ---------------------------------------------------------------------------
-- 9. documents table
-- Maps to: com.upstairstechno.entity.Document
-- storage_url = Supabase Storage object key (not a public URL)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS documents (
  id                BIGSERIAL   PRIMARY KEY,
  application_type  VARCHAR(20) NOT NULL CHECK (application_type IN ('OJT','INTERNSHIP')),
  application_id    VARCHAR(30) NOT NULL,
  document_type     VARCHAR(50) NOT NULL,
  file_name         VARCHAR(255),
  storage_url       VARCHAR(1000),   -- Supabase Storage object key
  uploaded_by       VARCHAR(100),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documents_app ON documents(application_type, application_id);

-- ---------------------------------------------------------------------------
-- 10. Application ID generation function
-- Generates: OJT-2026-00001 or INT-2026-00001
-- Called AFTER insert so we have the row id.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION generate_application_id(
  prefix TEXT,       -- 'OJT' or 'INT'
  row_id BIGINT
)
RETURNS TEXT
LANGUAGE plpgsql AS $$
DECLARE
  year_part TEXT;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  RETURN prefix || '-' || year_part || '-' || LPAD(row_id::TEXT, 5, '0');
END;
$$;

-- ---------------------------------------------------------------------------
-- 11. Atomic application submission function (OJT)
-- Handles: student find-or-create, duplicate check, insert, ID generation,
--          referral consumption (with advisory lock to prevent race conditions),
--          status history recording.
-- Returns the new application_id.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION submit_ojt_application(
  p_name            TEXT,
  p_mobile          TEXT,
  p_email           TEXT,
  p_gender          TEXT,
  p_college         TEXT,
  p_course          TEXT,
  p_year            TEXT,
  p_duration_weeks  INTEGER,
  p_training_mode   TEXT,
  p_track           TEXT,
  p_referral_code   TEXT DEFAULT NULL
)
RETURNS TABLE (
  application_id    TEXT,
  student_name      TEXT,
  referral_message  TEXT
)
LANGUAGE plpgsql AS $$
DECLARE
  v_student_id      BIGINT;
  v_referral_id     BIGINT;
  v_app_id          BIGINT;
  v_app_id_str      TEXT;
  v_referral_msg    TEXT;
  non_blocking_statuses application_status[] := ARRAY['REJECTED','CANCELLED','COMPLETED']::application_status[];
BEGIN
  -- 1. Duplicate check: same email, not in terminal statuses
  IF EXISTS (
    SELECT 1 FROM ojt_applications oa
    JOIN students s ON s.id = oa.student_id
    WHERE LOWER(s.email) = LOWER(p_email)
      AND oa.status != ALL(non_blocking_statuses)
  ) THEN
    RAISE EXCEPTION 'DUPLICATE_APPLICATION: An active OJT application already exists for this email address.';
  END IF;

  -- 2. Resolve referral code with advisory lock on the code row to prevent race
  IF p_referral_code IS NOT NULL AND p_referral_code != '' THEN
    SELECT id INTO v_referral_id
    FROM referral_codes
    WHERE LOWER(code) = LOWER(TRIM(p_referral_code))
      AND active = TRUE
      AND (expires_at IS NULL OR expires_at > NOW())
      AND used_count < max_uses
    FOR UPDATE;

    IF v_referral_id IS NULL THEN
      RAISE EXCEPTION 'INVALID_REFERRAL: This referral code is invalid, inactive, or has reached its usage limit.';
    END IF;
  END IF;

  -- 3. Find or create student (match by email case-insensitive)
  SELECT id INTO v_student_id FROM students WHERE LOWER(email) = LOWER(p_email) LIMIT 1;
  IF v_student_id IS NULL THEN
    INSERT INTO students (name, mobile, email, gender, college, course, year)
    VALUES (p_name, p_mobile, p_email, p_gender::gender_value, p_college, p_course, p_year)
    RETURNING id INTO v_student_id;
  ELSE
    -- Update student details with latest submitted values
    UPDATE students
    SET name = p_name, mobile = p_mobile,
        gender = p_gender::gender_value,
        college = p_college, course = p_course, year = p_year,
        updated_at = NOW()
    WHERE id = v_student_id;
  END IF;

  -- 4. Insert application with temp ID first, then update with real ID
  INSERT INTO ojt_applications (
    application_id, student_id, duration_weeks, training_mode, track,
    referral_code_id, status
  ) VALUES (
    'TEMP-' || gen_random_uuid()::text,
    v_student_id,
    p_duration_weeks,
    p_training_mode::training_mode,
    p_track::ojt_track,
    v_referral_id,
    'SUBMITTED'
  )
  RETURNING id INTO v_app_id;

  v_app_id_str := generate_application_id('OJT', v_app_id);

  UPDATE ojt_applications SET application_id = v_app_id_str WHERE id = v_app_id;

  -- 5. Increment referral usage (atomic, already locked)
  IF v_referral_id IS NOT NULL THEN
    UPDATE referral_codes SET used_count = used_count + 1 WHERE id = v_referral_id;
    v_referral_msg := 'Referral code applied successfully.';
  END IF;

  -- 6. Record status history
  INSERT INTO application_status_history (application_type, application_id, old_status, new_status, remarks, changed_by)
  VALUES ('OJT', v_app_id_str, NULL, 'SUBMITTED', 'Application submitted', 'SYSTEM');

  RETURN QUERY SELECT v_app_id_str, p_name, v_referral_msg;
END;
$$;

-- ---------------------------------------------------------------------------
-- 12. Atomic application submission function (Internship)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION submit_internship_application(
  p_name              TEXT,
  p_mobile            TEXT,
  p_email             TEXT,
  p_gender            TEXT,
  p_college           TEXT,
  p_course            TEXT,
  p_year              TEXT,
  p_duration_months   INTEGER,
  p_mode              TEXT,
  p_domain            TEXT,
  p_referral_code     TEXT DEFAULT NULL
)
RETURNS TABLE (
  application_id    TEXT,
  student_name      TEXT,
  referral_message  TEXT
)
LANGUAGE plpgsql AS $$
DECLARE
  v_student_id      BIGINT;
  v_referral_id     BIGINT;
  v_app_id          BIGINT;
  v_app_id_str      TEXT;
  v_referral_msg    TEXT;
  non_blocking_statuses application_status[] := ARRAY['REJECTED','CANCELLED','COMPLETED']::application_status[];
BEGIN
  -- 1. Duplicate check
  IF EXISTS (
    SELECT 1 FROM internship_applications ia
    JOIN students s ON s.id = ia.student_id
    WHERE LOWER(s.email) = LOWER(p_email)
      AND ia.status != ALL(non_blocking_statuses)
  ) THEN
    RAISE EXCEPTION 'DUPLICATE_APPLICATION: An active Internship application already exists for this email address.';
  END IF;

  -- 2. Resolve referral code
  IF p_referral_code IS NOT NULL AND p_referral_code != '' THEN
    SELECT id INTO v_referral_id
    FROM referral_codes
    WHERE LOWER(code) = LOWER(TRIM(p_referral_code))
      AND active = TRUE
      AND (expires_at IS NULL OR expires_at > NOW())
      AND used_count < max_uses
    FOR UPDATE;

    IF v_referral_id IS NULL THEN
      RAISE EXCEPTION 'INVALID_REFERRAL: This referral code is invalid, inactive, or has reached its usage limit.';
    END IF;
  END IF;

  -- 3. Find or create student
  SELECT id INTO v_student_id FROM students WHERE LOWER(email) = LOWER(p_email) LIMIT 1;
  IF v_student_id IS NULL THEN
    INSERT INTO students (name, mobile, email, gender, college, course, year)
    VALUES (p_name, p_mobile, p_email, p_gender::gender_value, p_college, p_course, p_year)
    RETURNING id INTO v_student_id;
  ELSE
    UPDATE students
    SET name = p_name, mobile = p_mobile,
        gender = p_gender::gender_value,
        college = p_college, course = p_course, year = p_year,
        updated_at = NOW()
    WHERE id = v_student_id;
  END IF;

  -- 4. Insert application
  INSERT INTO internship_applications (
    application_id, student_id, duration_months, mode, domain,
    referral_code_id, status
  ) VALUES (
    'TEMP-' || gen_random_uuid()::text,
    v_student_id,
    p_duration_months,
    p_mode::training_mode,
    p_domain::internship_domain,
    v_referral_id,
    'SUBMITTED'
  )
  RETURNING id INTO v_app_id;

  v_app_id_str := generate_application_id('INT', v_app_id);

  UPDATE internship_applications SET application_id = v_app_id_str WHERE id = v_app_id;

  -- 5. Increment referral
  IF v_referral_id IS NOT NULL THEN
    UPDATE referral_codes SET used_count = used_count + 1 WHERE id = v_referral_id;
    v_referral_msg := 'Referral code applied successfully.';
  END IF;

  -- 6. Status history
  INSERT INTO application_status_history (application_type, application_id, old_status, new_status, remarks, changed_by)
  VALUES ('INTERNSHIP', v_app_id_str, NULL, 'SUBMITTED', 'Application submitted', 'SYSTEM');

  RETURN QUERY SELECT v_app_id_str, p_name, v_referral_msg;
END;
$$;

-- ---------------------------------------------------------------------------
-- 13. Update resume path after Supabase Storage upload
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_resume_path(
  p_application_id      TEXT,
  p_resume_path         TEXT,
  p_resume_file_name    TEXT,
  p_resume_content_type TEXT,
  p_resume_file_size    BIGINT
)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  IF p_application_id LIKE 'OJT%' THEN
    UPDATE ojt_applications
    SET resume_path = p_resume_path,
        resume_file_name = p_resume_file_name,
        resume_content_type = p_resume_content_type,
        resume_file_size = p_resume_file_size,
        updated_at = NOW()
    WHERE application_id = p_application_id;
  ELSIF p_application_id LIKE 'INT%' THEN
    UPDATE internship_applications
    SET resume_path = p_resume_path,
        resume_file_name = p_resume_file_name,
        resume_content_type = p_resume_content_type,
        resume_file_size = p_resume_file_size,
        updated_at = NOW()
    WHERE application_id = p_application_id;
  END IF;

  -- Also record in documents table
  INSERT INTO documents (application_type, application_id, document_type, file_name, storage_url)
  VALUES (
    CASE WHEN p_application_id LIKE 'OJT%' THEN 'OJT' ELSE 'INTERNSHIP' END,
    p_application_id,
    'RESUME',
    p_resume_file_name,
    p_resume_path
  )
  ON CONFLICT DO NOTHING;
END;
$$;

-- ---------------------------------------------------------------------------
-- 14. Dashboard statistics function (called by Edge Function with service role)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_dashboard_statistics()
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'totalOjtApplications',        (SELECT COUNT(*) FROM ojt_applications),
    'totalInternshipApplications', (SELECT COUNT(*) FROM internship_applications),
    'pendingApplications',
      (SELECT COUNT(*) FROM ojt_applications WHERE status IN ('SUBMITTED','UNDER_REVIEW')) +
      (SELECT COUNT(*) FROM internship_applications WHERE status IN ('SUBMITTED','UNDER_REVIEW')),
    'selectedStudents',
      (SELECT COUNT(*) FROM ojt_applications WHERE status = 'SELECTED') +
      (SELECT COUNT(*) FROM internship_applications WHERE status = 'SELECTED'),
    'completedStudents',
      (SELECT COUNT(*) FROM ojt_applications WHERE status = 'COMPLETED') +
      (SELECT COUNT(*) FROM internship_applications WHERE status = 'COMPLETED'),
    'totalReferralCodes', (SELECT COUNT(*) FROM referral_codes),
    'ojtStatusBreakdown', (
      SELECT json_object_agg(s.status_val, COALESCE(c.cnt, 0))
      FROM (VALUES ('SUBMITTED'),('UNDER_REVIEW'),('SELECTED'),('REJECTED'),
                   ('JOINED'),('IN_PROGRESS'),('COMPLETED'),('CANCELLED')) AS s(status_val)
      LEFT JOIN (
        SELECT status::TEXT, COUNT(*) as cnt FROM ojt_applications GROUP BY status
      ) c ON c.status = s.status_val
    ),
    'internshipStatusBreakdown', (
      SELECT json_object_agg(s.status_val, COALESCE(c.cnt, 0))
      FROM (VALUES ('SUBMITTED'),('UNDER_REVIEW'),('SELECTED'),('REJECTED'),
                   ('JOINED'),('IN_PROGRESS'),('COMPLETED'),('CANCELLED')) AS s(status_val)
      LEFT JOIN (
        SELECT status::TEXT, COUNT(*) as cnt FROM internship_applications GROUP BY status
      ) c ON c.status = s.status_val
    )
  ) INTO result;
  RETURN result;
END;
$$;
