-- Supabase Storage bucket for Playwright screenshot previews

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'petal-previews',
  'petal-previews',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public read petal previews" ON storage.objects;
CREATE POLICY "Public read petal previews"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'petal-previews');

DROP POLICY IF EXISTS "Service upload petal previews" ON storage.objects;
CREATE POLICY "Service upload petal previews"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'petal-previews');

DROP POLICY IF EXISTS "Service update petal previews" ON storage.objects;
CREATE POLICY "Service update petal previews"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'petal-previews');

DROP POLICY IF EXISTS "Service delete petal previews" ON storage.objects;
CREATE POLICY "Service delete petal previews"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'petal-previews');
