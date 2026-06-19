-- Global search: FTS across title, url, note, platform + composite indexes for filters

ALTER TABLE public.petals DROP COLUMN IF EXISTS search_vector;

ALTER TABLE public.petals ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(note, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(url, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(platform, '')), 'C')
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_petals_search ON public.petals USING GIN(search_vector);

CREATE INDEX IF NOT EXISTS idx_petals_user_platform_created
  ON public.petals(user_id, platform, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_petals_user_viewed_created
  ON public.petals(user_id, viewed, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_petals_user_created_at
  ON public.petals(user_id, created_at DESC);
