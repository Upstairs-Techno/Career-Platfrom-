-- Transactional outbox for company notifications. Each new application gets
-- exactly one durable notification event in the same DB transaction.
CREATE TABLE public.application_notification_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_type TEXT NOT NULL CHECK (application_type IN ('OJT', 'INTERNSHIP')),
  application_id VARCHAR(50) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent')),
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  locked_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (application_type, application_id)
);

CREATE INDEX application_notification_outbox_pending_idx
  ON public.application_notification_outbox (next_attempt_at, created_at)
  WHERE status = 'pending';

ALTER TABLE public.application_notification_outbox ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.application_notification_outbox FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.application_notification_outbox TO service_role;

CREATE OR REPLACE FUNCTION public.enqueue_application_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Submission RPCs first insert TEMP-<uuid>, then update to the final ID.
  IF OLD.application_id LIKE 'TEMP-%' AND NEW.application_id NOT LIKE 'TEMP-%' THEN
    INSERT INTO public.application_notification_outbox (application_type, application_id)
    VALUES (TG_ARGV[0], NEW.application_id)
    ON CONFLICT (application_type, application_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.enqueue_application_notification() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER ojt_application_notification_outbox
  AFTER UPDATE OF application_id ON public.ojt_applications
  FOR EACH ROW EXECUTE FUNCTION public.enqueue_application_notification('OJT');

CREATE TRIGGER internship_application_notification_outbox
  AFTER UPDATE OF application_id ON public.internship_applications
  FOR EACH ROW EXECUTE FUNCTION public.enqueue_application_notification('INTERNSHIP');

CREATE OR REPLACE FUNCTION public.claim_application_notification(p_application_id TEXT DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  application_type TEXT,
  application_id VARCHAR(50),
  attempts INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  UPDATE public.application_notification_outbox AS event
  SET status = 'processing',
      attempts = event.attempts + 1,
      locked_at = NOW(),
      last_error = NULL
  WHERE event.id = (
    SELECT candidate.id
    FROM public.application_notification_outbox AS candidate
    WHERE (p_application_id IS NULL OR candidate.application_id = p_application_id)
      AND (
        (candidate.status = 'pending' AND candidate.next_attempt_at <= NOW())
        OR (candidate.status = 'processing' AND candidate.locked_at < NOW() - INTERVAL '5 minutes')
      )
    ORDER BY candidate.next_attempt_at, candidate.created_at
    FOR UPDATE SKIP LOCKED
    LIMIT 1
  )
  RETURNING event.id, event.application_type, event.application_id, event.attempts;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_application_notification(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_application_notification(TEXT) TO service_role;
