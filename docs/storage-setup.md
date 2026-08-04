# Supabase Storage Setup Guide (Agent-03)

This document contains all SQL and configuration steps required to set up the
`personal-files` storage bucket and the `file_metadata` table with full Row
Level Security (RLS) and user isolation.

> **Idempotent:** Every statement in this guide uses `IF NOT EXISTS`, `CREATE OR REPLACE`,
> `ON CONFLICT DO NOTHING`, or `DROP … IF EXISTS` guards — the entire script can be run
> multiple times without errors or data loss.

---

## 1. Create the `file_metadata` Table

Run this in **Supabase Dashboard → SQL Editor → New query**:

```sql
-- ──────────────────────────────────────────────────────────────────────────
-- file_metadata: stores metadata for every file uploaded to Storage.
-- The actual bytes live in the 'personal-files' Storage bucket.
-- Safe to run multiple times (fully idempotent).
-- ──────────────────────────────────────────────────────────────────────────

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

-- Index for fast per-user queries
CREATE INDEX IF NOT EXISTS file_metadata_owner_idx
  ON public.file_metadata (owner_id, created_at DESC);

-- Auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: DROP IF EXISTS first so re-runs don't error
DROP TRIGGER IF EXISTS file_metadata_updated_at ON public.file_metadata;
CREATE TRIGGER file_metadata_updated_at
  BEFORE UPDATE ON public.file_metadata
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Enable Row Level Security (idempotent — no-op if already enabled)
ALTER TABLE public.file_metadata ENABLE ROW LEVEL SECURITY;

-- ── RLS Policies (DROP IF EXISTS → CREATE pattern is idempotent) ──────────

DROP POLICY IF EXISTS "Users can view own files"   ON public.file_metadata;
CREATE POLICY "Users can view own files"
  ON public.file_metadata
  FOR SELECT
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can insert own files" ON public.file_metadata;
CREATE POLICY "Users can insert own files"
  ON public.file_metadata
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can update own files" ON public.file_metadata;
CREATE POLICY "Users can update own files"
  ON public.file_metadata
  FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can delete own files" ON public.file_metadata;
CREATE POLICY "Users can delete own files"
  ON public.file_metadata
  FOR DELETE
  USING (auth.uid() = owner_id);
```

---

## 2. Create the Storage Bucket

### Option A — Supabase Dashboard (Recommended for first setup)

1. Go to **Supabase Dashboard → Storage → New Bucket**.
2. **Name**: `personal-files`
3. **Public bucket**: ❌ OFF (private — access only via signed URLs)
4. **File size limit**: `104857600` (100 MB)
5. **Allowed MIME types** (paste the list below):

```
image/jpeg, image/png, image/gif, image/webp, image/svg+xml, image/bmp, image/tiff,
video/mp4, video/webm, video/ogg, video/quicktime, video/x-msvideo,
audio/mpeg, audio/ogg, audio/wav, audio/webm, audio/flac, audio/aac,
application/pdf, application/msword,
application/vnd.openxmlformats-officedocument.wordprocessingml.document,
application/vnd.ms-excel,
application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,
application/vnd.ms-powerpoint,
application/vnd.openxmlformats-officedocument.presentationml.presentation,
application/zip, application/x-7z-compressed, application/x-tar, application/gzip,
application/x-rar-compressed, text/plain, text/csv, text/markdown, text/html,
text/css, text/javascript, application/json, application/xml, text/xml
```

### Option B — SQL (using service role, idempotent)

```sql
-- ON CONFLICT (id) DO NOTHING makes this safe to re-run
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
```

---

## 3. Storage Bucket RLS Policies

Run this in **Supabase Dashboard → SQL Editor → New query**:

```sql
-- ──────────────────────────────────────────────────────────────────────────
-- Storage RLS for the 'personal-files' bucket.
-- User isolation: each user's files live under storage_path: {userId}/...
-- auth.uid()::text ensures the path prefix always matches the current user.
-- Safe to run multiple times (DROP IF EXISTS → CREATE pattern).
-- ──────────────────────────────────────────────────────────────────────────

-- Allow authenticated users to upload files ONLY under their own user-id folder
DROP POLICY IF EXISTS "Users can upload to own folder" ON storage.objects;
CREATE POLICY "Users can upload to own folder"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'personal-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to read files ONLY from their own folder
DROP POLICY IF EXISTS "Users can read own files" ON storage.objects;
CREATE POLICY "Users can read own files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'personal-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to update (replace) files in their own folder
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
CREATE POLICY "Users can update own files"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'personal-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'personal-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to delete files from their own folder
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
CREATE POLICY "Users can delete own files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'personal-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
```

> **Note on `DROP POLICY IF EXISTS` on `storage.objects`:**
> `storage.objects` is shared across all buckets. The policies above are
> bucket-scoped (`bucket_id = 'personal-files'`), so dropping and recreating
> them is safe and only affects the `personal-files` bucket.

---

## 4. How User Isolation Works

| Layer | Mechanism |
|-------|-----------|
| **Storage path** | Every file is stored at `{userId}/{uuid}-{filename}`. The `userId` folder is the primary namespace. |
| **Storage RLS** | `storage.objects` policies check `(storage.foldername(name))[1] = auth.uid()::text` — a user cannot read, write, update, or delete another user's files at the storage layer. |
| **`file_metadata` RLS** | All four operations (SELECT, INSERT, UPDATE, DELETE) on the metadata table are gated by `auth.uid() = owner_id`. |
| **Application layer** | `storage.service.ts` calls `supabase.auth.getUser()` at the start of every operation and performs an explicit `owner_id === user.id` check before issuing signed URLs or deletions. |

Three independent layers must all be bypassed simultaneously to access another user's data — this is defence-in-depth.

---

## 5. Idempotency Summary

| Statement | Safe to re-run? | Guard used |
|-----------|-----------------|------------|
| `CREATE TABLE IF NOT EXISTS` | ✅ | `IF NOT EXISTS` |
| `CREATE INDEX IF NOT EXISTS` | ✅ | `IF NOT EXISTS` |
| `CREATE OR REPLACE FUNCTION` | ✅ | `OR REPLACE` |
| `DROP TRIGGER IF EXISTS` + `CREATE TRIGGER` | ✅ | `DROP IF EXISTS` before create |
| `ALTER TABLE … ENABLE ROW LEVEL SECURITY` | ✅ | No-op if already enabled |
| `DROP POLICY IF EXISTS` + `CREATE POLICY` (×8) | ✅ | `DROP IF EXISTS` before create |
| `INSERT … ON CONFLICT DO NOTHING` | ✅ | `ON CONFLICT DO NOTHING` |

**All statements are idempotent — the script can be run any number of times safely.**

---

## 6. Verification Checklist

After running the SQL above, verify in the Supabase Dashboard:

- [ ] **Table Editor** → `file_metadata` table exists with the correct columns.
- [ ] **Authentication → Policies** → `file_metadata` has four policies (SELECT, INSERT, UPDATE, DELETE).
- [ ] **Storage** → `personal-files` bucket exists, **Public** is OFF.
- [ ] **Storage → Policies** → four storage policies exist for `personal-files`.
- [ ] **API test**: Upload a file as User A, then attempt to list/download it as User B — expect 0 results / 403.
