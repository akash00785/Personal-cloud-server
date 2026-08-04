# Changelog

All notable changes to this project will be documented in this file.

---

## [0.3.0] — 2026-08-04

### Agent-03 — Supabase Storage Foundation

#### Added
- **`services/storage.service.ts`** — Core storage operations with full user isolation:
  - `uploadFile(fileBuffer, fileName, mimeType, fileSize)` — validates, uploads to Supabase Storage, persists `file_metadata` row; rolls back storage object on metadata failure
  - `listUserFiles()` — returns all files owned by the authenticated user, newest first
  - `getSignedDownloadUrl(fileId)` — generates a 1-hour signed URL after ownership verification
  - `deleteFile(fileId)` — removes storage object and metadata row atomically; ownership verified at both RLS and application layers
- **`app/api/files/route.ts`** — `GET /api/files` — list authenticated user's files
- **`app/api/files/upload/route.ts`** — `POST /api/files/upload` — multipart file upload with validation and structured error codes (400/401/422/500)
- **`app/api/files/[id]/route.ts`** — `GET /api/files/[id]` (signed download URL) and `DELETE /api/files/[id]` (delete file); returns 401/403/404/500 as appropriate
- **`docs/storage-setup.md`** — Complete SQL guide for:
  - `file_metadata` table with RLS (SELECT/INSERT/UPDATE/DELETE per-user policies)
  - `personal-files` Storage bucket (private, 100 MB limit, explicit MIME type allowlist)
  - Storage bucket RLS policies using `storage.foldername(name)[1] = auth.uid()::text`
  - User isolation explanation (3 independent layers)
- **`.env.example`** — Documents all required environment variables including the server-only `SUPABASE_SERVICE_ROLE_KEY`

#### Modified
- **`types/index.ts`** — Added `FileMetadataRow`, `UploadResult`, `FileListItem`, `FileValidationResult` interfaces
- **`lib/constants.ts`** — Added `STORAGE_BUCKET`, strongly-typed `ALLOWED_MIME_TYPES` array, `SIGNED_URL_EXPIRY_SECONDS`; replaced loose `ACCEPTED_FILE_TYPES` string with derived value
- **`lib/validation.ts`** — Added `isValidFileName`, `isAllowedMimeType`, `isAllowedFileSize`, `validateUploadedFile`; all file upload validation is centralised here

#### Security
- Three-layer user isolation: storage path prefix `{userId}/…` + Storage RLS + `file_metadata` RLS
- Application-level ownership double-check in `deleteFile` and `getSignedDownloadUrl` (defence-in-depth)
- File name sanitisation prevents path traversal in storage paths
- MIME type allowlist enforced at both validation layer and Storage bucket config
- 100 MB file size cap enforced at validation layer and Storage bucket config
- `SUPABASE_SERVICE_ROLE_KEY` documented as server-only, never prefixed with `NEXT_PUBLIC_`

---

## [0.2.1] — 2026-08-04

### Agent-02 — Security Audit & Hardening

#### Fixed
- **Open Redirect (CWE-601)** — `app/auth/login/page.tsx` was using the raw `redirectTo` query parameter directly with `router.push()`, allowing an attacker to craft a link like `/auth/login?redirectTo=https://evil.com` that redirects users to arbitrary external sites after login. Fixed by routing all redirects through the new `sanitizeRedirectPath()` helper which enforces relative-paths-only.

- **Missing server-side input validation** — `app/auth/actions.ts` accepted form inputs and passed them to Supabase without any server-side checks. A malformed or excessively long input could cause unexpected errors or be used for enumeration. Fixed by adding explicit validation for email format, password length, display name length/character set, and avatar URL protocol (HTTPS only).

#### Added
- **`lib/validation.ts`** — Shared, pure validation utilities used by Server Actions:
  - `isValidEmail(email)` — RFC 5322 simplified format check
  - `isValidPassword(password)` — minimum 8-character enforcement
  - `isValidDisplayName(name)` — length cap (80 chars) and control-character rejection
  - `isValidAvatarUrl(url)` — HTTPS-only URL enforcement
  - `sanitizeRedirectPath(input, fallback)` — rejects external URLs, protocol-relative URLs (`//`), and encoded-slash bypass attempts (`/%2F`)

---

## [0.2.0] — 2026-08-04

### Agent-02 — Authentication & User System

#### Added
- `proxy.ts` — Next.js 16 proxy with session refresh + protected route guards
- `app/auth/actions.ts` — Server Actions: `signUp`, `signIn`, `signOut`, `updateProfile`
- `app/auth/layout.tsx` — Centered card layout for auth pages
- `app/auth/login/page.tsx` — Email/Password login
- `app/auth/signup/page.tsx` — Email/Password sign-up with password confirmation
- `app/auth/callback/route.ts` — OAuth/email confirmation callback handler
- `app/(protected)/layout.tsx` — Server-side auth guard (2nd layer protection)
- `app/(protected)/dashboard/page.tsx` — Protected dashboard page
- `app/(protected)/profile/page.tsx` — Protected profile page
- `components/auth/SignOutButton.tsx` — Client sign-out button
- `components/profile/ProfileForm.tsx` — Client profile edit form
- `hooks/useAuth.ts` — Client-side auth state hook
- `services/auth.service.ts` — `getProfile()`, `ensureProfile()` server helpers
- `docs/supabase-setup.md` — SQL migration: `profiles` table, RLS policies, trigger

#### Modified
- `components/layout/Header.tsx` — Auth-aware UI
- `components/layout/Sidebar.tsx` — Active-state navigation
- `app/page.tsx` — Server Component, auth-aware CTA
- `types/index.ts` — Added `ProfileRow`
- `lib/constants.ts` — Added `AUTH_ROUTES`, `PROTECTED_ROUTES`

---

## [0.1.0] — 2026-08-04

### Agent-01 — Foundation

#### Added
- Bootstrapped Next.js 16 with TypeScript, Tailwind CSS v4, App Router
- ESLint, Prettier, dark theme, responsive layout
- Supabase browser/server/middleware clients
- Reusable UI and layout components
- Custom hooks, utilities, constants, global types
