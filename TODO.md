# TODO

## 🔴 Critical (Before Agent-03 starts)

- [ ] **Run Supabase SQL migration** — Open `docs/supabase-setup.md` and execute the SQL in Supabase Dashboard → SQL Editor. This creates the `profiles` table, Row Level Security policies, and the `handle_new_user` trigger.
- [ ] **Configure Supabase Auth settings** — Set Site URL and Redirect URLs in Dashboard → Authentication → URL Configuration.

---

## 🟡 Agent-03: File Management

- [ ] Create file manager page (`/files`)
- [ ] Implement file upload API route (`/api/files/upload`)
- [ ] Implement file download API route (`/api/files/[id]/download`)
- [ ] Implement file delete API route
- [ ] List files from Supabase Storage
- [ ] Create Supabase Storage bucket (`personal-files`) with RLS
- [ ] Display file list with name, size, type, date

---

## 🟡 Agent-04+: Additional Features

- [ ] Connect Google Drive integration
- [ ] Implement remote downloader (URL → cloud)
- [ ] Implement media streaming (audio/video)
- [ ] Implement search functionality
- [ ] Create Settings page (`/settings`)
- [ ] Configure Render deployment (`render.yaml`)
- [ ] Add testing setup (Jest / Vitest + Testing Library)

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
