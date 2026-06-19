-- Idempotent PetalFlow bootstrap (safe to re-run)
-- Policies use DROP IF EXISTS to avoid duplicate errors

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  is_pro BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.petals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  note TEXT,
  platform TEXT NOT NULL DEFAULT 'website'
    CHECK (platform IN ('youtube', 'instagram', 'tiktok', 'x', 'linkedin', 'medium', 'facebook', 'website')),
  preview_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  viewed BOOLEAN NOT NULL DEFAULT false,
  theme TEXT,
  preview_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (preview_status IN ('pending', 'processing', 'completed', 'fallback', 'failed')),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'inbox'
    CHECK (status IN ('inbox', 'viewed', 'archived'))
);

CREATE TABLE IF NOT EXISTS public.petal_previews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  petal_id UUID NOT NULL REFERENCES public.petals(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  source TEXT NOT NULL CHECK (source IN ('opengraph', 'playwright', 'fallback', 'youtube', 'extension')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL DEFAULT '#6B7B6E',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.collection_petals (
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  petal_id UUID NOT NULL REFERENCES public.petals(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (collection_id, petal_id)
);

CREATE TABLE IF NOT EXISTS public.garden_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  petal_count INTEGER NOT NULL DEFAULT 0,
  growth_level INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, slug)
);

-- Search vector (migration 20250618200000)
ALTER TABLE public.petals DROP COLUMN IF EXISTS search_vector;
ALTER TABLE public.petals ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(note, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(url, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(platform, '')), 'C')
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_petals_user_id ON public.petals(user_id);
CREATE INDEX IF NOT EXISTS idx_petals_created_at ON public.petals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_petals_platform ON public.petals(platform);
CREATE INDEX IF NOT EXISTS idx_petals_theme ON public.petals(theme);
CREATE INDEX IF NOT EXISTS idx_petals_viewed ON public.petals(viewed);
CREATE INDEX IF NOT EXISTS idx_petals_user_created ON public.petals(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_petals_search ON public.petals USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_petals_user_platform_created ON public.petals(user_id, platform, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_petals_user_viewed_created ON public.petals(user_id, viewed, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_petals_user_status ON public.petals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_petals_user_status_created ON public.petals(user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_petal_previews_petal_id ON public.petal_previews(petal_id);
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON public.collections(user_id);
CREATE INDEX IF NOT EXISTS idx_garden_topics_user_id ON public.garden_topics(user_id);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.petals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.petal_previews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_petals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.garden_topics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view own petals" ON public.petals;
DROP POLICY IF EXISTS "Users can insert own petals" ON public.petals;
DROP POLICY IF EXISTS "Users can update own petals" ON public.petals;
DROP POLICY IF EXISTS "Users can delete own petals" ON public.petals;
DROP POLICY IF EXISTS "Service can insert petals" ON public.petals;
CREATE POLICY "Users can view own petals" ON public.petals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own petals" ON public.petals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own petals" ON public.petals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own petals" ON public.petals FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Service can insert petals" ON public.petals FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own previews" ON public.petal_previews;
DROP POLICY IF EXISTS "Service can manage previews" ON public.petal_previews;
CREATE POLICY "Users can view own previews" ON public.petal_previews FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.petals WHERE petals.id = petal_previews.petal_id AND petals.user_id = auth.uid()));
CREATE POLICY "Service can manage previews" ON public.petal_previews FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users can manage own collections" ON public.collections;
CREATE POLICY "Users can manage own collections" ON public.collections FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own collection petals" ON public.collection_petals;
CREATE POLICY "Users can manage own collection petals" ON public.collection_petals FOR ALL
  USING (EXISTS (SELECT 1 FROM public.collections WHERE collections.id = collection_petals.collection_id AND collections.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can manage own garden topics" ON public.garden_topics;
CREATE POLICY "Users can manage own garden topics" ON public.garden_topics FOR ALL USING (auth.uid() = user_id);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('petal-previews', 'petal-previews', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "Public read petal previews" ON storage.objects;
DROP POLICY IF EXISTS "Service upload petal previews" ON storage.objects;
DROP POLICY IF EXISTS "Service update petal previews" ON storage.objects;
DROP POLICY IF EXISTS "Service delete petal previews" ON storage.objects;
CREATE POLICY "Public read petal previews" ON storage.objects FOR SELECT USING (bucket_id = 'petal-previews');
CREATE POLICY "Service upload petal previews" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'petal-previews');
CREATE POLICY "Service update petal previews" ON storage.objects FOR UPDATE USING (bucket_id = 'petal-previews');
CREATE POLICY "Service delete petal previews" ON storage.objects FOR DELETE USING (bucket_id = 'petal-previews');

CREATE OR REPLACE FUNCTION update_garden_topic_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.theme IS NOT NULL THEN
    INSERT INTO public.garden_topics (user_id, name, slug, petal_count, growth_level)
    VALUES (NEW.user_id, NEW.theme, lower(replace(NEW.theme, ' ', '-')), 1, 1)
    ON CONFLICT (user_id, slug) DO UPDATE SET
      petal_count = garden_topics.petal_count + 1,
      growth_level = LEAST(5, 1 + (garden_topics.petal_count + 1) / 3);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_garden_topic ON public.petals;
CREATE TRIGGER trigger_update_garden_topic
  AFTER INSERT ON public.petals FOR EACH ROW
  EXECUTE FUNCTION update_garden_topic_count();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.petals;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
