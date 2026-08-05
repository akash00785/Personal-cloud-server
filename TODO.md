# TODO

## 🔴 Critical (Before using Storage or Folder API)

- [ ] **Run Supabase SQL migration** — Execute SQL in `docs/supabase-setup.md` first (profiles table + RLS + trigger).
- [ ] **Run Storage SQL migration** — Execute SQL in `docs/storage-setup.md` (file_metadata table + RLS + Storage bucket + Storage bucket RLS).
- [ ] **Run Folder SQL migration** — Execute SQL in `docs/folder-setup.md` (folders table + RLS + folder_id column on file_metadata).
- [ ] **Configure Supabase Auth settings** — Set Site URL and Redirect URLs in Dashboard → Authentication → URL Configuration.

---

## 🔴 Critical (Before using File Sharing)

- [ ] **Run Share SQL migration** — Execute SQL in `docs/share-setup.md` (file_shares table + RLS).
- [ ] **Add `SUPABASE_SERVICE_ROLE_KEY`** to `.env.local` — required for public share token resolution.

---

## 🟡 Agent-08+: Additional Features

- [ ] Connect Google Drive integration
- [ ] Implement remote downloader (URL → cloud)
- [ ] Implement media streaming (audio/video)
- [ ] Implement search functionality (server-side, across file content)
- [ ] Create Settings page (`/settings`)
- [ ] Configure Render deployment (`render.yaml`)
- [ ] Add testing setup (Jest / Vitest + Testing Library)
- [ ] Add rate limiting on upload and auth routes
- [ ] Add image thumbnails in grid view (inline preview without opening dialog)
- [ ] Update Dashboard stats (total files, storage used, last activity) using `/api/files`
- [ ] Add file move between folders (drag & drop or context menu)
- [ ] Add folder move / nested folder drag & drop

---

## ✅ Completed

- [x] Project foundation (Next.js, TypeScript, Tailwind, ESLint, Prettier)
- [x] Supabase client setup (browser + server + proxy)
- [x] Dark theme + responsive layout
- [x] Reusable UI components (Button, Input, Card, Badge, Spinner)
- [x] Layout components (Header, Footer, Sidebar, PageWrapper)
- [x] Custom hooks (useLocalStorage, useTheme, useMediaQuery, useAuth)
- [x] Email/Password Sign Up
- [x] Email/Password Login
- [x] Logout (Sign Out button)
- [x] Session management (proxy.ts refresh)
- [x] Protected routes (proxy.ts + `(protected)` layout guard)
- [x] Auth Server Actions (signIn, signUp, signOut, updateProfile)
- [x] Auth callback route
- [x] User profile create/read/update
- [x] Profile page UI
- [x] Auth-aware Header and Home page
- [x] Open redirect fix + server-side input validation
- [x] Supabase Storage bucket configuration (docs/storage-setup.md)
- [x] Storage RLS policies (user isolation via path prefix + DB RLS)
- [x] `file_metadata` table with RLS
- [x] `services/storage.service.ts` — upload, list, signed URL, delete
- [x] `GET /api/files` — list user's files (supports ?folderId= filter)
- [x] `POST /api/files/upload` — upload file (supports folderId field)
- [x] `GET /api/files/[id]` — signed download URL
- [x] `DELETE /api/files/[id]` — delete file
- [x] File validation (name, MIME type, size) in `lib/validation.ts`
- [x] `.env.example` with all storage env vars
- [x] `/files` page — File Manager UI (grid/list, search, sort, upload, delete)
- [x] Drag & drop upload zone (keyboard accessible)
- [x] Multiple file upload with per-file XHR progress bars
- [x] File download (signed URL → browser download)
- [x] File delete with confirmation dialog
- [x] Search by file name (client-side, live filter)
- [x] Sort by Name / Size / Date (asc/desc toggle)
- [x] Empty state, loading state, error state, no-results state
- [x] Mobile + Tablet + Desktop responsive
- [x] **Folder System — Create Folder** (`POST /api/folders`, `CreateFolderDialog`)
- [x] **Folder System — Rename Folder** (`PATCH /api/folders/:id`, `RenameFolderDialog`)
- [x] **Folder System — Delete Folder** (`DELETE /api/folders/:id`, `DeleteFolderDialog`)
- [x] **Folder System — Breadcrumb Navigation** (`GET /api/folders/:id/path`, `Breadcrumb` component)
- [x] **Folder System — Folder List UI** (`FolderCard`, `FolderRow`, integrated in `/files` page)
- [x] **Folder SQL Migration** (docs/folder-setup.md — idempotent, can run multiple times)
- [x] **File Preview System — Image** (jpg, jpeg, png, gif, webp, svg+xml) via `PreviewDialog`
- [x] **File Preview System — PDF** (inline iframe preview) via `PreviewDialog`
- [x] **File Preview System — Video** (mp4, webm, ogg) via `PreviewDialog`
- [x] **File Preview System — Audio** (mp3/mpeg, wav, ogg) via `PreviewDialog`
- [x] **File Preview System — File Info Panel** (name, type, MIME, size, upload date)
- [x] **File Preview System — Download Button** in preview dialog
- [x] **File Preview System — Responsive** (mobile bottom sheet, tablet/desktop modal)
- [x] **Secure File Sharing — Share Button** (FileCard, FileRow, PreviewDialog)
- [x] **Secure File Sharing — Generate Link** (`POST /api/files/:id/share`, UUID token, `services/share.service.ts`)
- [x] **Secure File Sharing — Expiry Support** (1 Hour / 24 Hours / 7 Days / Never)
- [x] **Secure File Sharing — Copy Link Button** (`ShareDialog`, clipboard API with fallback)
- [x] **Secure File Sharing — Revoke Link** (`DELETE /api/files/:id/share/:shareId`, revoked_at timestamp)
- [x] **Secure File Sharing — Status Badges** (Active / Expired / Revoked in `ShareDialog`)
- [x] **Secure File Sharing — Public Share Page** (`/share/[token]`, no login, download only, error states)
- [x] **Secure File Sharing — SQL Migration** (`docs/share-setup.md`, `file_shares` table + RLS)
