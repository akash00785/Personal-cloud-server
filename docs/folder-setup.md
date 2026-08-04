# Folder System — Supabase SQL Migration (Agent-05)

This document contains all SQL and configuration steps required to set up the
`folders` table and the `folder_id` column on `file_metadata`.

> **Idempotent:** Every statement in this guide uses `IF NOT EXISTS`,
> `CREATE OR REPLACE`, `ON CONFLICT DO NOTHING`, or `DROP … IF EXISTS` guards —
> the entire script can be run multiple times without errors or data loss.

---

## 1. Run this SQL in Supabase Dashboard → SQL Editor → New query

```sql
-- ──────────────────────────────────────────────────────────────────────────
-- Agent-05: Folder System Migration
-- Safe to run multiple times (fully idempotent).
-- ──────────────────────────────────────────────────────────────────────────

-- ── Step 1: Create the folders table ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.folders (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id   UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT        NOT NULL,
  parent_id  UUID        REFERENCES public.folders(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast per-user queries
CREATE INDEX IF NOT EXISTS folders_owner_idx
  ON public.folders (owner_id, parent_id, name);

-- Auto-update updated_at on row modification
-- The set_updated_at() function was created in the storage migration;
-- CREATE OR REPLACE is safe to run again.
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS folders_updated_at ON public.folders;
CREATE TRIGGER folders_updated_at
  BEFORE UPDATE ON public.folders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Enable Row Level Security
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

-- ── RLS Policies for folders ──────────────────────────────────────────────

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

-- ── Step 2: Add folder_id to file_metadata ─────────────────────────────────
-- ON DELETE SET NULL: deleting a folder moves its files to root (no data loss)

ALTER TABLE public.file_metadata
  ADD COLUMN IF NOT EXISTS folder_id UUID
    REFERENCES public.folders(id)
    ON DELETE SET NULL;

-- Index for fast per-folder file queries
CREATE INDEX IF NOT EXISTS file_metadata_folder_idx
  ON public.file_metadata (owner_id, folder_id, created_at DESC);
```

---

## 2. Verify in Supabase Dashboard

After running the SQL above, verify:

- [ ] **Table Editor** → `folders` table exists with columns: `id`, `owner_id`,
      `name`, `parent_id`, `created_at`, `updated_at`.
- [ ] **Authentication → Policies** → `folders` has four RLS policies
      (SELECT, INSERT, UPDATE, DELETE).
- [ ] **Table Editor** → `file_metadata` now has a `folder_id` column (nullable UUID).
- [ ] **Table Editor** → `file_metadata` → existing rows have `folder_id = NULL`
      (they become root-level files).

---

## 3. How Folder Isolation Works

| Layer | Mechanism |
|-------|-----------|
| **Folders RLS** | All four operations (SELECT, INSERT, UPDATE, DELETE) on `folders` gated by `auth.uid() = owner_id`. |
| **Files FK** | `file_metadata.folder_id` references `folders(id) ON DELETE SET NULL` — deleting a folder safely moves its files to root. |
| **Sub-folders FK** | `folders.parent_id` references `folders(id) ON DELETE CASCADE` — deleting a folder recursively deletes all descendant folders. |
| **Application layer** | `folder.service.ts` verifies `owner_id` at every mutation before the DB call (defence-in-depth). |

---

## 4. Idempotency Summary

| Statement | Safe to re-run? | Guard used |
|-----------|-----------------|------------|
| `CREATE TABLE IF NOT EXISTS` | ✅ | `IF NOT EXISTS` |
| `CREATE INDEX IF NOT EXISTS` (×2) | ✅ | `IF NOT EXISTS` |
| `CREATE OR REPLACE FUNCTION` | ✅ | `OR REPLACE` |
| `DROP TRIGGER IF EXISTS` + `CREATE TRIGGER` | ✅ | `DROP IF EXISTS` before create |
| `ALTER TABLE … ENABLE ROW LEVEL SECURITY` | ✅ | No-op if already enabled |
| `DROP POLICY IF EXISTS` + `CREATE POLICY` (×4) | ✅ | `DROP IF EXISTS` before create |
| `ADD COLUMN IF NOT EXISTS` | ✅ | `IF NOT EXISTS` |

**All statements are idempotent — the script can be run any number of times safely.**

---

## 5. API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/folders?parentId=<uuid\|root>` | List folders in a parent (or root) |
| `POST` | `/api/folders` | Create a folder `{ name, parentId? }` |
| `PATCH` | `/api/folders/:id` | Rename a folder `{ name }` |
| `DELETE` | `/api/folders/:id` | Delete a folder (sub-folders cascade, files → root) |
| `GET` | `/api/folders/:id/path` | Get breadcrumb trail `BreadcrumbItem[]` |
