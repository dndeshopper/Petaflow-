-- PetalFlow Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  is_pro BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Petals table
CREATE TABLE IF NOT EXISTS public.petals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  note TEXT,
  platform TEXT NOT NULL DEFAULT 'website' CHECK (platform IN ('youtube', 'instagram', 'tiktok', 'x', 'linkedin', 'medium', 'website')),
  preview_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  viewed BOOLEAN NOT NULL DEFAULT false,
  theme TEXT,
  preview_status TEXT NOT NULL DEFAULT 'pending' CHECK (preview_status IN ('pending', 'processing', 'completed', 'fallback', 'failed')),
  description TEXT
);

-- Petal previews table
CREATE TABLE IF NOT EXISTS public.petal_previews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  petal_id UUID NOT NULL REFERENCES public.petals(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  source TEXT NOT NULL CHECK (source IN ('opengraph', 'playwright', 'fallback')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Collections table
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL DEFAULT '#6B7B6E',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Collection petals junction
CREATE TABLE IF NOT EXISTS public.collection_petals (
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  petal_id UUID NOT NULL REFERENCES public.petals(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (collection_id, petal_id)
);

-- Garden topics table
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_petals_user_id ON public.petals(user_id);
CREATE INDEX IF NOT EXISTS idx_petals_created_at ON public.petals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_petals_platform ON public.petals(platform);
CREATE INDEX IF NOT EXISTS idx_petals_theme ON public.petals(theme);
CREATE INDEX IF NOT EXISTS idx_petals_viewed ON public.petals(viewed);
CREATE INDEX IF NOT EXISTS idx_petals_user_created ON public.petals(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_petal_previews_petal_id ON public.petal_previews(petal_id);
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON public.collections(user_id);
CREATE INDEX IF NOT EXISTS idx_garden_topics_user_id ON public.garden_topics(user_id);

-- Full text search
ALTER TABLE public.petals ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(note, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(theme, '')), 'C')
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_petals_search ON public.petals USING GIN(search_vector);

-- Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.petals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.petal_previews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_petals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.garden_topics ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Petals policies
CREATE POLICY "Users can view own petals" ON public.petals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own petals" ON public.petals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own petals" ON public.petals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own petals" ON public.petals FOR DELETE USING (auth.uid() = user_id);

-- Service role can insert petals (for Chrome extension API)
CREATE POLICY "Service can insert petals" ON public.petals FOR INSERT WITH CHECK (true);

-- Petal previews policies
CREATE POLICY "Users can view own previews" ON public.petal_previews FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.petals WHERE petals.id = petal_previews.petal_id AND petals.user_id = auth.uid()));
CREATE POLICY "Service can manage previews" ON public.petal_previews FOR ALL WITH CHECK (true);

-- Collections policies
CREATE POLICY "Users can manage own collections" ON public.collections FOR ALL USING (auth.uid() = user_id);

-- Collection petals policies
CREATE POLICY "Users can manage own collection petals" ON public.collection_petals FOR ALL
  USING (EXISTS (SELECT 1 FROM public.collections WHERE collections.id = collection_petals.collection_id AND collections.user_id = auth.uid()));

-- Garden topics policies
CREATE POLICY "Users can manage own garden topics" ON public.garden_topics FOR ALL USING (auth.uid() = user_id);

-- Function to update garden topic counts
CREATE OR REPLACE FUNCTION update_garden_topic_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.theme IS NOT NULL THEN
    INSERT INTO public.garden_topics (user_id, name, slug, petal_count, growth_level)
    VALUES (
      NEW.user_id,
      NEW.theme,
      lower(replace(NEW.theme, ' ', '-')),
      1,
      LEAST(5, 1 + (1 / 3))
    )
    ON CONFLICT (user_id, slug) DO UPDATE SET
      petal_count = garden_topics.petal_count + 1,
      growth_level = LEAST(5, 1 + (garden_topics.petal_count + 1) / 3);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_garden_topic
  AFTER INSERT ON public.petals
  FOR EACH ROW
  EXECUTE FUNCTION update_garden_topic_count();

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
