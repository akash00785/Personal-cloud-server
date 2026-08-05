-- ============================================================================
-- Personal Cloud Server — Complete Supabase Migration
-- ============================================================================
-- Run this ONCE in Supabase Dashboard → SQL Editor → New query.
-- Every statement is fully idempotent: safe to re-run any number of times.
--
-- Execution order matters:
--   1. profiles        (references auth.users)
--   2. file_metadata   (references auth.users)
--   3. folders         (references auth.users, and itself for parent_id)
--   4. file_metadata folder_id column  (references folders)
--   5. file_shares     (references file_metadata and auth.users)
--   6. Storage bucket
--   7. Storage RLS policies
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. profiles table  (from docs/supabase-setup.md)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT,
  display_name TEXT,
  avatar_url   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile"   ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Trigger: auto-create profile row when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. shared updated_at trigger function  (from docs/storage-setup.md)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. file_metadata table  (from docs/storage-setup.md)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.file_metadata (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_path TEXT        NOT NULL UNIQUE,
  file_name    TEXT        NOT NULL,
  file_size    BIGINT      NOT NULL CHECK (file_size > 0),
  mime_type    TEXT        NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS file_metadata_owner_idx
  ON public.file_metadata (owner_id, created_at DESC);

DROP TRIGGER IF EXISTS file_metadata_updated_at ON public.file_metadata;
CREATE TRIGGER file_metadata_updated_at
  BEFORE UPDATE ON public.file_metadata
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.file_metadata ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own files"   ON public.file_metadata;
CREATE POLICY "Users can view own files"
  ON public.file_metadata FOR SELECT
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can insert own files" ON public.file_metadata;
CREATE POLICY "Users can insert own files"
  ON public.file_metadata FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can update own files" ON public.file_metadata;
CREATE POLICY "Users can update own files"
  ON public.file_metadata FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can delete own files" ON public.file_metadata;
CREATE POLICY "Users can delete own files"
  ON public.file_metadata FOR DELETE
  USING (auth.uid() = owner_id);

-- Grant authenticated role explicit permissions (defence-in-depth)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.file_metadata TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. folders table  (from docs/folder-setup.md)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.folders (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id   UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT        NOT NULL,
  parent_id  UUID        REFERENCES public.folders(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS folders_owner_idx
  ON public.folders (owner_id, parent_id, name);

DROP TRIGGER IF EXISTS folders_updated_at ON public.folders;
CREATE TRIGGER folders_updated_at
  BEFORE UPDATE ON public.folders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own folders"   ON public.folders;
CREATE POLICY "Users can view own folders"
  ON public.folders FOR SELECT
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can insert own folders" ON public.folders;
CREATE POLICY "Users can insert own folders"
  ON public.folders FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can update own folders" ON public.folders;
CREATE POLICY "Users can update own folders"
  ON public.folders FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can delete own folders" ON public.folders;
CREATE POLICY "Users can delete own folders"
  ON public.folders FOR DELETE
  USING (auth.uid() = owner_id);

-- Grant authenticated role explicit permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.folders TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Add folder_id column to file_metadata  (from docs/folder-setup.md)
--    ON DELETE SET NULL: deleting a folder moves its files to root
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.file_metadata
  ADD COLUMN IF NOT EXISTS folder_id UUID
    REFERENCES public.folders(id)
    ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS file_metadata_folder_idx
  ON public.file_metadata (owner_id, folder_id, created_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. file_shares table  (from docs/share-setup.md)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.file_shares (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id    UUID        NOT NULL REFERENCES public.file_metadata(id) ON DELETE CASCADE,
  owner_id   UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token      TEXT        NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NULL,
  revoked_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS file_shares_token_idx
  ON public.file_shares (token);

CREATE INDEX IF NOT EXISTS file_shares_file_owner_idx
  ON public.file_shares (file_id, owner_id, created_at DESC);

ALTER TABLE public.file_shares ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view own shares"   ON public.file_shares;
CREATE POLICY "Owners can view own shares"
  ON public.file_shares FOR SELECT
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can create shares"     ON public.file_shares;
CREATE POLICY "Owners can create shares"
  ON public.file_shares FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can update own shares" ON public.file_shares;
CREATE POLICY "Owners can update own shares"
  ON public.file_shares FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can delete own shares" ON public.file_shares;
CREATE POLICY "Owners can delete own shares"
  ON public.file_shares FOR DELETE
  USING (auth.uid() = owner_id);

-- Grant authenticated role explicit permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.file_shares TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. Storage bucket: personal-files
--    (If already created via the Dashboard, this is a no-op)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'personal-files',
  'personal-files',
  false,
  104857600,
  ARRAY[
    'image/jpeg','image/png','image/gif','image/webp','image/svg+xml','image/bmp','image/tiff',
    'video/mp4','video/webm','video/ogg','video/quicktime','video/x-msvideo',
    'audio/mpeg','audio/ogg','audio/wav','audio/webm','audio/flac','audio/aac',
    'application/pdf','application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip','application/x-7z-compressed','application/x-tar',
    'application/gzip','application/x-rar-compressed',
    'text/plain','text/csv','text/markdown','text/html','text/css',
    'text/javascript','application/json','application/xml','text/xml'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. Storage RLS policies for personal-files bucket
--    User isolation: files are stored at {userId}/{uuid}-{filename}
--    Policies check (storage.foldername(name))[1] = auth.uid()::text
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can upload to own folder" ON storage.objects;
CREATE POLICY "Users can upload to own folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'personal-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can read own files" ON storage.objects;
CREATE POLICY "Users can read own files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'personal-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
CREATE POLICY "Users can update own files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'personal-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'personal-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
CREATE POLICY "Users can delete own files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'personal-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
-- After running, verify in Supabase Dashboard:
--   Table Editor:
--     ✓ profiles     — 6 columns, RLS enabled, 3 policies
--     ✓ file_metadata — 9 columns (inc. folder_id), RLS enabled, 4 policies
--     ✓ folders       — 6 columns, RLS enabled, 4 policies
--     ✓ file_shares   — 7 columns, RLS enabled, 4 policies
--   Storage:
--     ✓ personal-files bucket exists, Public = OFF
--     ✓ 4 storage.objects policies for personal-files
-- ============================================================================
