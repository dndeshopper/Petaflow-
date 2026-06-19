-- PetalFlow: core petals table
-- Run in Supabase SQL Editor or via `supabase db push`

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
    CHECK (platform IN ('youtube', 'instagram', 'tiktok', 'x', 'linkedin', 'medium', 'website')),
  preview_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  viewed BOOLEAN NOT NULL DEFAULT false,
  theme TEXT,
  preview_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (preview_status IN ('pending', 'processing', 'completed', 'fallback', 'failed')),
  description TEXT
);

CREATE INDEX IF NOT EXISTS idx_petals_user_id ON public.petals(user_id);
CREATE INDEX IF NOT EXISTS idx_petals_created_at ON public.petals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_petals_user_created ON public.petals(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.petal_previews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  petal_id UUID NOT NULL REFERENCES public.petals(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  source TEXT NOT NULL CHECK (source IN ('opengraph', 'playwright', 'fallback')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_petal_previews_petal_id ON public.petal_previews(petal_id);

ALTER TABLE public.petal_previews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own previews" ON public.petal_previews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.petals
      WHERE petals.id = petal_previews.petal_id
        AND petals.user_id = auth.uid()
    )
  );

CREATE POLICY "Service can manage previews" ON public.petal_previews
  FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.petals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own petals" ON public.petals
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own petals" ON public.petals
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own petals" ON public.petals
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own petals" ON public.petals
  FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Enable live updates in the dashboard (optional; safe to ignore if already added)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.petals;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
