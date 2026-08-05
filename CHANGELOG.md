# Changelog

All notable changes to this project will be documented in this file.

---

## [0.8.0] — 2026-08-05

### Agent-08 — UI/UX Polish — Unified Design System

No new features, no API or schema changes. Pure visual/UX improvement pass.

#### Added
- **`app/globals.css`** — Full CSS design token system:
  - Glass-morphism variables (`--glass-bg`, `--glass-border`, `--glass-blur`)
  - Emerald + Blue accent palette (`--accent-emerald-*`, `--accent-blue-*`)
  - Custom border-radius tokens, scrollbar theming, `::selection` emerald tint
  - `@keyframes`: `shimmer`, `fadeInUp`, `scaleIn`, `slideUp`, `pulseDot`
  - Utility classes: `.glass`, `.glass-card`, `.skeleton`, `.animate-scale-in`, `.animate-fade-in-up`, `.animate-slide-up`, `.toast-*`, `.pulse-dot`
  - Global `focus-visible` ring color set to emerald (`#10b981`)

#### Changed (UI Components)
- **`components/ui/Button.tsx`** — Added `emerald` + `outline` variants; `xs` size; rounded-xl; `transition-all duration-200`; shadow on primary/emerald/destructive; ring-offset-zinc-950 focus
- **`components/ui/Card.tsx`** — Added `glass` + `elevated` variants; rounded-2xl; soft shadow; inset ring on glass
- **`components/ui/Input.tsx`** — Rounded-xl; emerald focus ring; hover border; `hint` prop; error state with inline icon + `role="alert"`
- **`components/ui/Badge.tsx`** — Added `emerald` variant; optional `dot` prop with per-variant color
- **`components/ui/Spinner.tsx`** — Added `xs` size; `color` prop (`default`|`emerald`|`blue`|`white`); default changed to `emerald`

#### Changed (Layout Components)
- **`components/layout/Header.tsx`** — Emerald-gradient logo icon; user avatar initial; "Get started" CTA emerald; `backdrop-blur-xl`; top accent gradient line
- **`components/layout/Sidebar.tsx`** — SVG icons replacing emoji; emerald active indicator dot; `aria-current`; rounded-xl nav links
- **`components/layout/Footer.tsx`** — Cleaned; emoji removed; simpler layout

#### Changed (File Components)
- **`components/files/FileCard.tsx`** — rounded-2xl; `hover:-translate-y-0.5`; emerald filename hover; emerald/blue action hovers; emerald download spinner; action reveal on hover
- **`components/files/FileRow.tsx`** — Same polish; `h-7` action buttons; hover translate on icon
- **`components/files/FileToolbar.tsx`** — rounded-xl search with emerald focus ring; updated placeholder; bg-opacity toggle groups
- **`components/files/DeleteDialog.tsx`** — `animate-scale-in`; rounded-2xl icon box; inline error with icon; backdrop via `style` prop; `ring-1 ring-inset ring-white/[0.04]`
- **`components/files/UploadZone.tsx`** — `min-h-[160px]`; emerald drag-over; `scale-110` icon on drag; `duration-300` transitions
- **`components/files/UploadQueue.tsx`** — `pulse-dot` active indicator; emerald gradient progress bar; rounded-xl icon boxes with border
- **`components/files/PreviewDialog.tsx`** — `animate-scale-in`; `ring-1 ring-inset`; emerald `Spinner`; `Button variant="emerald"` for download
- **`components/files/ShareDialog.tsx`** — `animate-scale-in`; emerald icon header; emerald expiry pill selected state; emerald Generate button; `StatusBadge` with dot; empty state illustration; CopyButton emerald copied state

#### Changed (Folder Components)
- **`components/folders/FolderCard.tsx`** — rounded-2xl card; amber icon box with border; `hover:scale-105` on icon; `animate-scale-in`
- **`components/folders/FolderRow.tsx`** — Amber icon with border; `h-7` action buttons; emerald/red hover states
- **`components/folders/Breadcrumb.tsx`** — rounded-lg crumb buttons; emerald focus ring; zinc-700 separator
- **`components/folders/CreateFolderDialog.tsx`** — `animate-scale-in`; `h-14 w-14` icon box with border; emerald Create button; inline error with icon; subtitle text
- **`components/folders/RenameFolderDialog.tsx`** — `animate-scale-in`; `h-14 w-14` icon box with border; inline error with icon; folder name in subtitle
- **`components/folders/DeleteFolderDialog.tsx`** — `animate-scale-in`; `h-14 w-14` icon box with border; inline error with icon; `leading-relaxed` description

#### Changed (Pages)
- **`app/(protected)/dashboard/page.tsx`** — Fully redesigned: welcome hero (avatar + gradient), storage overview stat cards with icons and per-card color accents, quick action cards with hover arrow reveal; emoji removed; dark glassmorphism aesthetic
- **`app/(protected)/files/page.tsx`** — List view container: `rounded-2xl` / `bg-zinc-950/60`; table header: `bg-zinc-900/40` / tighter tracking

#### Quality
- `npm run build`: ✓ zero errors | `npm run lint`: ✓ zero errors | `npx tsc --noEmit`: ✓ zero errors | `npm audit`: 0 vulnerabilities

---

## [0.7.0] — 2026-08-05

### Agent-07 — Secure File Sharing System

#### Added
- **`types/index.ts`** — New types: `ShareExpiry`, `ShareStatus`, `ShareLinkRow`, `ShareLinkItem`, `ResolvedShare`
- **`lib/constants.ts`** — New constants: `SHARE_BASE_PATH`, `SHARE_EXPIRY_MS`, `SHARE_EXPIRY_LABELS`, `SHARE_EXPIRY_OPTIONS`, `SHARE_DOWNLOAD_URL_EXPIRY_SECONDS`
- **`lib/supabase/admin.ts`** — Admin Supabase client (service role key); bypasses RLS; server-only
- **`services/share.service.ts`** — Full share link business logic
- **`app/api/files/[id]/share/route.ts`** — `POST` create share + `GET` list shares (authenticated)
- **`app/api/files/[id]/share/[shareId]/route.ts`** — `DELETE` revoke share (authenticated)
- **`app/api/share/[token]/route.ts`** — `GET` public resolve endpoint (no auth required)
- **`hooks/useFileSharing.ts`** — Client hook: `fetchLinks`, `createLink`, `revokeLink`
- **`components/files/ShareDialog.tsx`** — Full share management dialog
- **`app/share/[token]/page.tsx`** — Public share page (no login, download only, error states)
- **`docs/share-setup.md`** — SQL migration guide + API reference + security notes

#### Changed
- **`components/files/FileCard.tsx`** — Added `onShare` prop + Share button
- **`components/files/FileRow.tsx`** — Added `onShare` prop + Share button
- **`components/files/PreviewDialog.tsx`** — Added `onShare` prop + Share button in footer
- **`app/(protected)/files/page.tsx`** — `pendingShareFile` state + `ShareDialog` wired up

#### Quality
- `npm audit`: 0 vulnerabilities | Build: ✓ | ESLint: ✓ (0 errors) | TypeScript: ✓ (0 errors)

---

## [0.6.0] — 2026-08-04

### Agent-06 — File Preview System

#### Added
- **`hooks/useFilePreview.ts`** — fetches signed URL for preview on demand
- **`components/files/PreviewDialog.tsx`** — image, PDF, video, audio, info panel, download
- **`components/files/FileCard.tsx`** / **`FileRow.tsx`** — `onPreview` prop + Preview button

#### Quality
- `npm audit`: 0 vulnerabilities | Build: ✓ | ESLint: ✓ | TypeScript: ✓

---

## [0.5.0] — 2026-08-04

### Agent-05 — Folder System

#### Added
- Folder CRUD API (`/api/folders`, `/api/folders/[id]`, `/api/folders/[id]/path`)
- `services/folder.service.ts`, `hooks/useFolders.ts`
- `components/folders/` — Breadcrumb, FolderCard, FolderRow, CreateFolderDialog, RenameFolderDialog, DeleteFolderDialog
- `docs/folder-setup.md`

#### Quality
- Build ✓ | ESLint ✓ | npm audit 0 vulnerabilities

---

## [0.4.0] — 2026-08-04

### Agent-04 — File Manager UI

#### Added
- `hooks/useFiles.ts`, `hooks/useFileUpload.ts`
- `components/files/` — FileIcon, UploadZone, UploadQueue, FileCard, FileRow, FileToolbar, DeleteDialog
- `app/(protected)/files/page.tsx` — full file manager

---

## [0.3.0] — 2026-08-04

### Agent-03 — Supabase Storage Foundation

#### Added
- `services/storage.service.ts`, file API routes, `docs/storage-setup.md`

---

## [0.2.1] — 2026-08-04

### Agent-02 — Security Audit

#### Fixed
- Open Redirect (CWE-601) — `sanitizeRedirectPath()` in `lib/validation.ts`
- Missing server-side input validation in all Server Actions

---

## [0.2.0] — 2026-08-04

### Agent-02 — Authentication & User System

#### Added
- `proxy.ts`, auth pages/actions, protected route group, Dashboard, Profile, `useAuth`, `auth.service.ts`

---

## [0.1.0] — 2026-08-04

### Agent-01 — Foundation

#### Added
- Next.js 16, TypeScript, Tailwind CSS v4, App Router, ESLint, Prettier
- Supabase clients, dark theme, layout components, UI components, hooks, utilities
