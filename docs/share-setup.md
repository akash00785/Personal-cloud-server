# Secure File Sharing Setup Guide (Agent-07)

This document contains all SQL and configuration steps required to enable the
Secure File Sharing System. Run these statements in **Supabase Dashboard → SQL Editor**.

> **Idempotent:** Every statement uses `IF NOT EXISTS`, `CREATE OR REPLACE`,
> `ON CONFLICT DO NOTHING`, or `DROP … IF EXISTS` guards — the entire script can
> be run multiple times without errors or data loss.

---

## Prerequisites

Before running this migration, ensure the following have already been applied:

- `docs/supabase-setup.md` — `profiles` table + RLS
- `docs/storage-setup.md` — `file_metadata` table + Storage bucket + RLS
- `docs/folder-setup.md` — `folders` table + RLS

---

## 1. Environment Variable — Service Role Key

The public share endpoint uses `SUPABASE_SERVICE_ROLE_KEY` (server-only, never
`NEXT_PUBLIC_`) to bypass RLS when resolving a share token.

Add to your `.env.local`:

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

> Find it in **Supabase Dashboard → Project Settings → API → service_role (secret)**.
> Never commit this key — it is already in `.gitignore` via `.env*`.

---

## 2. Create the `file_shares` Table

Run in **Supabase Dashboard → SQL Editor → New query**:

```sql
-- ──────────────────────────────────────────────────────────────────────────
-- file_shares: stores secure share links for files.
-- Each row represents one share link identified by a random UUID token.
-- expires_at NULL = link never expires.
-- revoked_at NULL = link is active (not revoked).
-- Safe to run multiple times (fully idempotent).
-- ──────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.file_shares (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id    UUID        NOT NULL REFERENCES public.file_metadata(id) ON DELETE CASCADE,
  owner_id   UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token      TEXT        NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NULL,
  revoked_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index: fast lookup by token (used by public share page)
CREATE UNIQUE INDEX IF NOT EXISTS file_shares_token_idx
  ON public.file_shares (token);

-- Index: fast listing of a file's share links by owner
CREATE INDEX IF NOT EXISTS file_shares_file_owner_idx
  ON public.file_shares (file_id, owner_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.file_shares ENABLE ROW LEVEL SECURITY;

-- ── RLS Policies ──────────────────────────────────────────────────────────

-- Owners can view their own share links
DROP POLICY IF EXISTS "Owners can view own shares" ON public.file_shares;
CREATE POLICY "Owners can view own shares"
  ON public.file_shares
  FOR SELECT
  USING (auth.uid() = owner_id);

-- Owners can create share links for their own files
DROP POLICY IF EXISTS "Owners can create shares" ON public.file_shares;
CREATE POLICY "Owners can create shares"
  ON public.file_shares
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Owners can update (revoke) their own share links
DROP POLICY IF EXISTS "Owners can update own shares" ON public.file_shares;
CREATE POLICY "Owners can update own shares"
  ON public.file_shares
  FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Owners can delete their own share links
DROP POLICY IF EXISTS "Owners can delete own shares" ON public.file_shares;
CREATE POLICY "Owners can delete own shares"
  ON public.file_shares
  FOR DELETE
  USING (auth.uid() = owner_id);
```

> **Note on public share resolution:** The `GET /api/share/[token]` route uses
> the Supabase **service role key** (admin client) to look up shares by token
> and generate signed storage URLs. This bypasses RLS entirely — no additional
> anon-role policy is required.

---

## 3. Verification Checklist

After running the SQL above:

- [ ] **Table Editor** → `file_shares` table exists with columns:
      `id`, `file_id`, `owner_id`, `token`, `expires_at`, `revoked_at`, `created_at`
- [ ] **Authentication → Policies** → `file_shares` has four policies
      (SELECT, INSERT, UPDATE, DELETE) all scoped to `owner_id = auth.uid()`
- [ ] `.env.local` contains `SUPABASE_SERVICE_ROLE_KEY`
- [ ] **Share flow test:**
  1. Log in, go to `/files`, click Share on any file
  2. Pick an expiry, click "Generate Link"
  3. Copy the generated `/share/<token>` URL
  4. Open the URL in an incognito tab (no login) — file info and Download button appear
  5. Click Download — file downloads successfully
  6. Back in the Share dialog, click Revoke
  7. Refresh the incognito tab — error page appears ("revoked")

---

## 4. How Security Works

| Layer | Mechanism |
|-------|-----------|
| **Token** | Random UUID (128 bits of entropy) — unguessable |
| **Expiry** | Server-side check at resolution time; expired links return HTTP 410 |
| **Revocation** | `revoked_at` timestamp; revoked links return HTTP 410 immediately |
| **File access** | Admin client generates a Supabase signed URL valid for 1 hour only |
| **RLS** | `file_shares` owner policies prevent any user from managing another's links |
| **No auth on share page** | Only the token is required — intentional for public sharing |
| **No edit/delete on share page** | Public page is read-only (view + download only) |

---

## 5. Idempotency Summary

| Statement | Safe to re-run? | Guard used |
|-----------|-----------------|------------|
| `CREATE TABLE IF NOT EXISTS` | ✅ | `IF NOT EXISTS` |
| `CREATE UNIQUE INDEX IF NOT EXISTS` | ✅ | `IF NOT EXISTS` |
| `CREATE INDEX IF NOT EXISTS` | ✅ | `IF NOT EXISTS` |
| `ALTER TABLE … ENABLE ROW LEVEL SECURITY` | ✅ | No-op if already enabled |
| `DROP POLICY IF EXISTS` + `CREATE POLICY` (×4) | ✅ | `DROP IF EXISTS` before create |

**All statements are idempotent — the script can be run any number of times safely.**

---

## 6. API Reference

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/files/:id/share` | Required | Create a share link |
| `GET` | `/api/files/:id/share` | Required | List share links for a file |
| `DELETE` | `/api/files/:id/share/:shareId` | Required | Revoke a share link |
| `GET` | `/api/share/:token` | None | Resolve a public share token |
| Page | `/share/:token` | None | Public share page (view + download) |

### POST body (`/api/files/:id/share`)

```json
{ "expiry": "1h" }
```

`expiry` options: `"1h"` · `"24h"` · `"7d"` · `"never"`

### Share status values

| Status | Condition |
|--------|-----------|
| `active` | Not revoked AND (no expiry OR `expires_at` is in the future) |
| `expired` | `expires_at` is in the past AND not revoked |
| `revoked` | `revoked_at` is not null |
