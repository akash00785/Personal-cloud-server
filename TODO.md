# TODO

## 🔴 Critical (Before using Storage API)

- [ ] **Run Supabase SQL migration** — Execute SQL in `docs/supabase-setup.md` first (profiles table + RLS + trigger).
- [ ] **Run Storage SQL migration** — Execute SQL in `docs/storage-setup.md` (file_metadata table + RLS + Storage bucket + Storage bucket RLS).
- [ ] **Configure Supabase Auth settings** — Set Site URL and Redirect URLs in Dashboard → Authentication → URL Configuration.

---

## 🟡 Agent-05+: Additional Features

- [ ] Connect Google Drive integration
- [ ] Implement remote downloader (URL → cloud)
- [ ] Implement media streaming (audio/video)
- [ ] Implement search functionality (server-side, across file content)
- [ ] Create Settings page (`/settings`)
- [ ] Configure Render deployment (`render.yaml`)
- [ ] Add testing setup (Jest / Vitest + Testing Library)
- [ ] Add rate limiting on upload and auth routes
- [ ] Add file preview (image thumbnails in grid view)
- [ ] Update Dashboard stats (total files, storage used, last activity) using `/api/files`

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
- [x] `GET /api/files` — list user's files
- [x] `POST /api/files/upload` — upload file
- [x] `GET /api/files/[id]` — signed download URL
- [x] `DELETE /api/files/[id]` — delete file
- [x] File validation (name, MIME type, size) in `lib/validation.ts`
- [x] `.env.example` with all storage env vars
- [x] `/files` page — File Manager UI
- [x] Grid view and List view
- [x] Drag & drop upload zone (keyboard accessible)
- [x] Multiple file upload with per-file XHR progress bars
- [x] File download (signed URL → browser download)
- [x] File delete with confirmation dialog
- [x] Search by file name (client-side, live filter)
- [x] Sort by Name / Size / Date (asc/desc toggle)
- [x] Empty state, loading state, error state, no-results state
- [x] Mobile + Tablet + Desktop responsive
