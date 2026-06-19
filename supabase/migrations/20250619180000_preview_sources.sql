-- Allow new preview sources (youtube, extension)
ALTER TABLE public.petal_previews
  DROP CONSTRAINT IF EXISTS petal_previews_source_check;

ALTER TABLE public.petal_previews
  ADD CONSTRAINT petal_previews_source_check
  CHECK (source IN ('opengraph', 'playwright', 'fallback', 'youtube', 'extension'));
