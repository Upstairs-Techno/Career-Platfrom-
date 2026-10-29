-- The submission RPCs first insert TEMP-<uuid> (41 characters), then replace
-- it with the final OJT-/INT- application ID. The original VARCHAR(30) limit
-- rejected that intermediate value and rolled back every submission.
ALTER TABLE public.ojt_applications
  ALTER COLUMN application_id TYPE VARCHAR(50);

ALTER TABLE public.internship_applications
  ALTER COLUMN application_id TYPE VARCHAR(50);
