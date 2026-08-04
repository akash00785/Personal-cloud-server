# Project Status

**Last Updated:** 2026-08-04
**Agent:** Agent-03 (Supabase Storage Foundation)
**Phase:** Storage Backend — File Upload / Download / Delete / User Isolation

---

## ✅ Completed Tasks (Agent-01)

- [x] Bootstrapped Next.js 16 with TypeScript, Tailwind CSS v4, App Router
- [x] Configured ESLint and Prettier
- [x] Created clean folder structure
- [x] Installed Supabase client packages (`@supabase/supabase-js`, `@supabase/ssr`)
- [x] Created Supabase browser, server, and middleware clients
- [x] Configured dark theme (zinc palette)
- [x] Created reusable layout components (Header, Footer, Sidebar, PageWrapper)
- [x] Created reusable UI components (Button, Input, Card, Badge, Spinner)
- [x] Created shared utility library, constants, and global TypeScript types
- [x] Created custom hooks (`useLocalStorage`, `useTheme`, `useMediaQuery`)
- [x] Created root layout, home page, error, not-found, loading pages
- [x] Build passing — zero errors

---

## ✅ Completed Tasks (Agent-02 — Auth)

- [x] Configured `.env.local` with Supabase credentials
- [x] Updated `proxy.ts` — protected routes + session refresh
- [x] Created Server Actions: `signUp`, `signIn`, `signOut`, `updateProfile`
- [x] Created Email/Password Sign Up and Login pages
- [x] Created Auth layout and callback route
- [x] Created protected route group `(protected)` with server-side auth guard
- [x] Created Dashboard and Profile pages
- [x] Created `ProfileForm` and `SignOutButton` client components
- [x] Created `useAuth` hook for client-side auth state
- [x] Created `services/auth.service.ts`
- [x] Updated Header (auth-aware), Sidebar, Home page
- [x] Created `docs/supabase-setup.md` — SQL migration guide

---

## ✅ Completed Tasks (Agent-02 — Security Audit)

- [x] **Fixed Open Redirect** — `sanitizeRedirectPath()` in `lib/validation.ts`; login page now validates `redirectTo` is a safe relative path only
- [x] **Added Server-side Input Validation** — `lib/validation.ts` with `isValidEmail`, `isValidPassword`, `isValidDisplayName`, `isValidAvatarUrl`; all Server Actions now validate inputs before touching the database
- [x] **Verified no hardcoded credentials** — grep confirmed zero hardcoded secrets in source files
- [x] **Verified `.gitignore`** — `.env*` and `.env.local` are excluded; confirmed not committed
- [x] **Verified RLS** — `docs/supabase-setup.md` defines full RLS policies (SELECT/UPDATE/INSERT per-user) + trigger
- [x] **Verified no XSS risk** — no `dangerouslySetInnerHTML`, React escapes all output by default
- [x] **Verified CSRF protection** — Next.js 16 Server Actions validate `Origin` header automatically
- [x] **Verified SQL Injection immunity** — Supabase uses PostgREST parameterized queries; no raw SQL in app code
- [x] **Verified cookie security** — `@supabase/ssr` sets `sameSite: 'lax'` (CSRF safe)
- [x] **Verified double auth guard** — proxy.ts + `(protected)/layout.tsx` both independently check auth
- [x] **npm audit** — 0 known vulnerabilities in dependencies
- [x] **Build** — zero errors, zero warnings
- [x] **ESLint** — zero errors, zero warnings

---

## ✅ Completed Tasks (Agent-03 — Supabase Storage Foundation)

- [x] **Expanded `types/index.ts`** — Added `FileMetadataRow`, `UploadResult`, `FileListItem`, `FileValidationResult` types
- [x] **Updated `lib/constants.ts`** — Added `STORAGE_BUCKET`, `ALLOWED_MIME_TYPES`, `SIGNED_URL_EXPIRY_SECONDS`; replaced loose `ACCEPTED_FILE_TYPES` with strongly-typed const
- [x] **Expanded `lib/validation.ts`** — Added `isValidFileName`, `isAllowedMimeType`, `isAllowedFileSize`, `validateUploadedFile` with full input checks
- [x] **Created `services/storage.service.ts`** — `uploadFile`, `listUserFiles`, `getSignedDownloadUrl`, `deleteFile`; user isolation via `{userId}/{uuid}-{filename}` path + ownership checks
- [x] **Created `app/api/files/route.ts`** — `GET` handler lists authenticated user's files
- [x] **Created `app/api/files/upload/route.ts`** — `POST` handler accepts multipart upload, validates, delegates to storage service
- [x] **Created `app/api/files/[id]/route.ts`** — `GET` returns signed download URL; `DELETE` removes file + metadata
- [x] **Created `docs/storage-setup.md`** — Full SQL for `file_metadata` table + RLS, Storage bucket creation, Storage bucket RLS; user-isolation explanation
- [x] **Created `.env.example`** — Documents all required env vars including `SUPABASE_SERVICE_ROLE_KEY` (server-only)
- [x] **Build** — zero errors, zero warnings
- [x] **ESLint** — zero errors, zero warnings
- [x] **TypeScript** — zero errors

---

## 🔲 Remaining Tasks (for Agent-04+)

- [ ] **⚠️ Run Supabase SQL migration** — Execute SQL in `docs/supabase-setup.md` AND `docs/storage-setup.md` before any file operations work
- [ ] Create file manager page (`/files`) — UI only, backend API is ready
- [ ] Connect Google Drive integration
- [ ] Implement remote downloader feature
- [ ] Implement media streaming
- [ ] Implement search functionality
- [ ] Create Settings page (`/settings`)
- [ ] **Future: Add rate limiting** on sign-in/sign-up and upload routes
- [ ] Configure Render deployment (render.yaml)
- [ ] Add testing setup (Jest / Vitest + Testing Library)

---

## 📦 Installed Packages

### Production Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 16.x | Framework |
| `react` | 19.x | UI library |
| `react-dom` | 19.x | DOM rendering |
| `@supabase/supabase-js` | ^2 | Supabase JS client |
| `@supabase/ssr` | ^0.12 | Supabase SSR helpers |
| `clsx` | ^2 | Conditional classnames |
| `tailwind-merge` | ^3 | Tailwind class merging |

> No new packages were added by Agent-03 — all storage operations use the already-installed `@supabase/supabase-js` client.

---

## 📁 Folder Structure

```
Personal-cloud-server/
├── app/
│   ├── (protected)/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   └── profile/page.tsx
│   ├── api/
│   │   └── files/
│   │       ├── route.ts          # GET  /api/files       — list files
│   │       ├── upload/
│   │       │   └── route.ts      # POST /api/files/upload — upload file
│   │       └── [id]/
│   │           └── route.ts      # GET/DELETE /api/files/[id]
│   ├── auth/
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── callback/route.ts
│   │   └── actions.ts
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   ├── error.tsx
│   ├── not-found.tsx
│   └── loading.tsx
├── components/
│   ├── auth/SignOutButton.tsx
│   ├── profile/ProfileForm.tsx
│   ├── ui/
│   └── layout/
├── hooks/
│   ├── useAuth.ts
│   ├── useLocalStorage.ts
│   ├── useTheme.ts
│   └── useMediaQuery.ts
├── lib/
│   ├── supabase/               # client.ts, server.ts, middleware.ts
│   ├── validation.ts           # file + auth validation helpers
│   ├── utils.ts
│   └── constants.ts            # STORAGE_BUCKET, ALLOWED_MIME_TYPES, MAX_UPLOAD_SIZE_*
├── services/
│   ├── auth.service.ts
│   ├── storage.service.ts      # uploadFile, listUserFiles, getSignedDownloadUrl, deleteFile
│   └── supabase.service.ts
├── types/index.ts               # FileMetadataRow, UploadResult, FileListItem, …
├── docs/
│   ├── architecture.md
│   ├── supabase-setup.md       # profiles table + RLS + trigger
│   └── storage-setup.md        # file_metadata table + RLS + Storage bucket + Storage RLS
├── proxy.ts
└── .env.example
```

---

## 📝 Notes for Agent-04

1. **Run BOTH SQL migrations** — `docs/supabase-setup.md` (profiles) and `docs/storage-setup.md` (file_metadata + storage bucket) must be executed in Supabase Dashboard before files work
2. **Backend API is complete** — `/api/files` (list), `/api/files/upload` (POST), `/api/files/[id]` (GET signed URL / DELETE) are ready
3. **Three-layer user isolation** — Storage path prefix, Storage RLS, file_metadata RLS all independently enforce per-user access
4. **All protected pages** go inside `app/(protected)/` — layout handles auth automatically
5. **Dark theme, `cn()`, `@/` alias** — always follow PROJECT_RULES.md
6. **Validation** — `lib/validation.ts` has `validateUploadedFile()` for filename, MIME type, and size checks
