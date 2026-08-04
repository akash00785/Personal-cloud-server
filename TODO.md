# TODO

## 🔴 Critical (Before using Storage API)

- [ ] **Run Supabase SQL migration** — Execute SQL in `docs/supabase-setup.md` first (profiles table + RLS + trigger).
- [ ] **Run Storage SQL migration** — Execute SQL in `docs/storage-setup.md` (file_metadata table + RLS + Storage bucket + Storage bucket RLS).
- [ ] **Configure Supabase Auth settings** — Set Site URL and Redirect URLs in Dashboard → Authentication → URL Configuration.

---

## 🟡 Agent-04: File Manager UI

- [ ] Create file manager page (`/files`) inside `app/(protected)/files/page.tsx`
- [ ] Build file list component — shows name, size, type, upload date
- [ ] Build file upload component — drag-and-drop or button; calls `POST /api/files/upload`
- [ ] Build file download button — calls `GET /api/files/[id]` → signed URL, triggers browser download
- [ ] Build file delete button — calls `DELETE /api/files/[id]` with confirmation dialog
- [ ] Handle empty state (no files yet)
- [ ] Show upload progress indicator

> The backend API is complete — all endpoints are in `app/api/files/`. The UI only needs to call them.

---

## 🟡 Agent-05+: Additional Features

- [ ] Connect Google Drive integration
- [ ] Implement remote downloader (URL → cloud)
- [ ] Implement media streaming (audio/video)
- [ ] Implement search functionality
- [ ] Create Settings page (`/settings`)
- [ ] Configure Render deployment (`render.yaml`)
- [ ] Add testing setup (Jest / Vitest + Testing Library)
- [ ] Add rate limiting on upload and auth routes

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
