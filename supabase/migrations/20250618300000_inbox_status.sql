-- Petal inbox status workflow

ALTER TABLE public.petals
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'inbox'
  CHECK (status IN ('inbox', 'viewed', 'archived'));

UPDATE public.petals
SET status = CASE
  WHEN viewed = true THEN 'viewed'
  ELSE 'inbox'
END
WHERE status IS NULL OR status = 'inbox';

CREATE INDEX IF NOT EXISTS idx_petals_user_status
  ON public.petals(user_id, status);

CREATE INDEX IF NOT EXISTS idx_petals_user_status_created
  ON public.petals(user_id, status, created_at DESC);
