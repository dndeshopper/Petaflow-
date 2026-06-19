-- Add Facebook as a recognized platform and backfill existing petals.

ALTER TABLE public.petals
  DROP CONSTRAINT IF EXISTS petals_platform_check;

UPDATE public.petals
SET platform = 'facebook'
WHERE platform = 'website'
  AND (
    url ILIKE '%facebook.com%'
    OR url ILIKE '%//fb.com/%'
    OR url ILIKE '%//www.fb.com/%'
    OR url ILIKE '%fb.watch%'
  );

ALTER TABLE public.petals
  ADD CONSTRAINT petals_platform_check
  CHECK (platform IN (
    'youtube', 'instagram', 'tiktok', 'x', 'linkedin', 'medium', 'facebook', 'website'
  ));
