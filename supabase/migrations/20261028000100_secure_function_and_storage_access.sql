-- Forward-only hardening migration. Apply only after confirming migrations
-- 20260001 and 20260002 are present in the target project's migration history.
-- It preserves existing application records and blocks direct browser access
-- to resume objects; privileged operations remain inside Edge Functions.

ALTER FUNCTION public.get_dashboard_statistics() SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION public.get_dashboard_statistics() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_dashboard_statistics() TO service_role;

REVOKE ALL ON FUNCTION public.update_resume_path(TEXT, TEXT, TEXT, TEXT, BIGINT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_resume_path(TEXT, TEXT, TEXT, TEXT, BIGINT)
  TO service_role;

REVOKE ALL ON FUNCTION public.submit_ojt_application(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, TEXT, TEXT, TEXT
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_ojt_application(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, TEXT, TEXT, TEXT
) TO service_role;

REVOKE ALL ON FUNCTION public.submit_internship_application(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, TEXT, TEXT, TEXT
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_internship_application(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, TEXT, TEXT, TEXT
) TO service_role;

CREATE OR REPLACE FUNCTION public.admin_update_application_status(
  p_application_id TEXT,
  p_new_status TEXT,
  p_remarks TEXT,
  p_changed_by TEXT
)
RETURNS TABLE (
  application_type TEXT,
  application_id TEXT,
  old_status application_status,
  new_status application_status,
  remarks TEXT,
  changed_by TEXT,
  student_name TEXT,
  student_email TEXT,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_old_status application_status;
  v_student_name TEXT;
  v_student_email TEXT;
  v_updated_at TIMESTAMPTZ;
  v_type TEXT;
BEGIN
  IF p_application_id LIKE 'OJT-%' THEN
    v_type := 'OJT';
    SELECT app.status, student.name, student.email
      INTO v_old_status, v_student_name, v_student_email
      FROM ojt_applications AS app
      JOIN students AS student ON student.id = app.student_id
      WHERE app.application_id = p_application_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'APPLICATION_NOT_FOUND'; END IF;

    UPDATE ojt_applications
      SET status = p_new_status::application_status,
          remarks = NULLIF(p_remarks, ''),
          updated_at = NOW()
      WHERE ojt_applications.application_id = p_application_id
      RETURNING ojt_applications.updated_at INTO v_updated_at;
  ELSIF p_application_id LIKE 'INT-%' THEN
    v_type := 'INTERNSHIP';
    SELECT app.status, student.name, student.email
      INTO v_old_status, v_student_name, v_student_email
      FROM internship_applications AS app
      JOIN students AS student ON student.id = app.student_id
      WHERE app.application_id = p_application_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'APPLICATION_NOT_FOUND'; END IF;

    UPDATE internship_applications
      SET status = p_new_status::application_status,
          remarks = NULLIF(p_remarks, ''),
          updated_at = NOW()
      WHERE internship_applications.application_id = p_application_id
      RETURNING internship_applications.updated_at INTO v_updated_at;
  ELSE
    RAISE EXCEPTION 'APPLICATION_NOT_FOUND';
  END IF;

  INSERT INTO application_status_history (
    application_type, application_id, old_status, new_status, remarks, changed_by
  ) VALUES (
    v_type, p_application_id, v_old_status, p_new_status::application_status,
    NULLIF(p_remarks, ''), p_changed_by
  );

  RETURN QUERY SELECT
    v_type, p_application_id, v_old_status, p_new_status::application_status,
    NULLIF(p_remarks, ''), p_changed_by, v_student_name, v_student_email, v_updated_at;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_update_application_status(TEXT, TEXT, TEXT, TEXT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_application_status(TEXT, TEXT, TEXT, TEXT)
  TO service_role;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes',
  'resumes',
  FALSE,
  5242880,
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO UPDATE
SET public = FALSE,
    file_size_limit = 5242880,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'block_direct_resume_object_access'
  ) THEN
    CREATE POLICY block_direct_resume_object_access
      ON storage.objects
      AS RESTRICTIVE
      FOR ALL
      TO anon, authenticated
      USING (bucket_id <> 'resumes')
      WITH CHECK (bucket_id <> 'resumes');
  END IF;
END;
$$;
