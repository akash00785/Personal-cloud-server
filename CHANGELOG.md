# Changelog

All notable changes to this project will be documented in this file.

---

## [0.6.0] — 2026-08-04

### Agent-06 — File Preview System

#### Added
- **`hooks/useFilePreview.ts`** — Client hook: fetches signed URL for preview on demand; all setState in Promise callbacks (satisfies `react-hooks/set-state-in-effect`)
- **`components/files/PreviewDialog.tsx`** — Full preview dialog:
  - `isPreviewable(mimeType)` — exported helper used by FileCard / FileRow to conditionally show Preview button
  - Image preview: `jpg`, `jpeg`, `png`, `gif`, `webp`, `svg+xml`, `bmp`, `tiff` — uses `<img>` with error fallback
  - PDF preview: `application/pdf` — uses `<iframe>` for inline rendering
  - Video preview: `mp4`, `webm`, `ogg`, `quicktime` — uses `<video controls>`
  - Audio preview: `mpeg`, `wav`, `ogg`, `flac`, `aac`, `webm` — uses `<audio controls>` with waveform decoration
  - Unsupported types: graceful "Preview not available" state with file icon
  - File Information Panel: File Name, Type, MIME Type, Size, Upload Date
  - Download button in footer (reuses existing `downloadFile` hook)
  - Responsive: bottom sheet on mobile, centered modal on tablet/desktop
  - Keyboard: Escape to close, focus management on open
  - Loading state (spinner), error state, image-load-error fallback

#### Changed
- **`components/files/FileCard.tsx`** — Added `onPreview` prop; Preview button (eye icon) on hover for previewable types; file name and icon are clickable to open preview
- **`components/files/FileRow.tsx`** — Added `onPreview` prop; Preview button added to action group for previewable types; file name and icon are clickable to open preview
- **`app/(protected)/files/page.tsx`** — Added `pendingPreviewFile` state, `handlePreviewOpen`/`handlePreviewClose` callbacks, `<PreviewDialog>` wired up; all existing folder and file dialogs unchanged

#### Security / Quality
- No API routes modified
- No database schema modified
- No authentication changed
- No folder system changed
- `npm audit`: 0 vulnerabilities | Build: ✓ | ESLint: ✓ | TypeScript: ✓

---

## [0.5.0] — 2026-08-04

### Agent-05 — Folder System

#### Added
- **`types/index.ts`** — New types: `FolderRow`, `FolderItem`, `BreadcrumbItem`
- **`lib/validation.ts`** — Added `isValidFolderName` (non-empty, max 255 chars, no path separators or control chars)
- **`services/folder.service.ts`** — Full folder CRUD with user isolation:
  - `createFolder(name, parentId?)` — validates name, verifies parent ownership, inserts row
  - `listFolders(parentId?)` — lists root or child folders ordered by name
  - `renameFolder(id, name)` — validates name, ownership check via RLS + application layer
  - `deleteFolder(id)` — ownership verified at two layers; sub-folders cascade, files set NULL (root)
  - `getFolderPath(folderId)` — walks tree iteratively (max depth 20) to build breadcrumb trail
- **`app/api/folders/route.ts`** — `GET /api/folders?parentId=` (list) + `POST /api/folders` (create)
- **`app/api/folders/[id]/route.ts`** — `PATCH /api/folders/:id` (rename) + `DELETE /api/folders/:id` (delete)
- **`app/api/folders/[id]/path/route.ts`** — `GET /api/folders/:id/path` (breadcrumb trail)
- **`hooks/useFolders.ts`** — Client hook:
  - `fetchFolders()` — manual refresh
  - `addFolder(name)` — POST + optimistic update
  - `editFolder(id, name)` — PATCH + optimistic update
  - `removeFolder(id)` — DELETE + removes from local state
  - Exposes `breadcrumbs` (BreadcrumbItem[]) fetched from path API
  - All setState calls in `.then()/.catch()` callbacks (satisfies `react-hooks/set-state-in-effect`)
- **`components/folders/Breadcrumb.tsx`** — Breadcrumb nav: clickable ancestor crumbs, current folder label
- **`components/folders/FolderCard.tsx`** — Grid view folder card (amber folder icon, click to open, rename/delete actions)
- **`components/folders/FolderRow.tsx`** — List view folder row (responsive columns, same actions)
- **`components/folders/CreateFolderDialog.tsx`** — Accessible modal: form with name input, keyboard (Escape), focus management
- **`components/folders/RenameFolderDialog.tsx`** — Accessible modal: pre-filled input, keyboard (Escape), re-keyed by parent
- **`components/folders/DeleteFolderDialog.tsx`** — Accessible modal: cascade warning, keyboard (Escape), focus on cancel
- **`docs/folder-setup.md`** — Idempotent SQL migration: `folders` table + RLS policies + `folder_id` column on `file_metadata`

#### Modified
- **`types/index.ts`** — `FileMetadataRow` gains `folder_id: string | null`; `FileListItem` gains `folderId: string | null`
- **`services/storage.service.ts`** — `uploadFile` accepts optional `folderId` param; `listUserFiles` accepts optional folder filter (undefined = all, null = root, uuid = specific folder)
- **`app/api/files/route.ts`** — `GET /api/files` now accepts `?folderId=<uuid|root>` query param (backward-compatible: omit = all files)
- **`app/api/files/upload/route.ts`** — `POST /api/files/upload` accepts optional `folderId` form field
- **`hooks/useFiles.ts`** — accepts optional `folderId` parameter; URL built conditionally
- **`app/(protected)/files/page.tsx`** — integrated folder navigation via URL `?folderId=`, breadcrumb, folder CRUD dialogs, folders shown before files in both grid and list views

#### Quality
- **Build** — zero TypeScript errors, zero build errors
- **ESLint** — zero errors, zero warnings
- **Security** — no new secret exposure; all folder operations enforce ownership via RLS + application layer; folder name sanitisation prevents injection; no hardcoded credentials
- **npm audit** — 0 known vulnerabilities

---

## [0.4.0] — 2026-08-04

### Agent-04 — File Manager UI

#### Added
- **`hooks/useFiles.ts`** — file list, refresh, delete, download (Promise-based)
- **`hooks/useFileUpload.ts`** — multiple file upload with XHR progress tracking
- **`components/files/FileIcon.tsx`** — SVG icon + color-coded background by MIME category
- **`components/files/UploadZone.tsx`** — drag & drop zone with keyboard accessibility
- **`components/files/UploadQueue.tsx`** — per-file progress bars with status indicators
- **`components/files/FileCard.tsx`** — grid view card with hover actions
- **`components/files/FileRow.tsx`** — list view row with responsive columns
- **`components/files/FileToolbar.tsx`** — search, sort, grid/list toggle
- **`components/files/DeleteDialog.tsx`** — accessible modal with confirm/cancel
- **`app/(protected)/files/page.tsx`** — full file manager page

#### Modified
- **`types/index.ts`** — Added `SortField`, `SortOrder`, `ViewMode`, `UploadingFile` types

#### Quality
- **Build** — zero errors, zero TypeScript errors
- **ESLint** — zero errors, zero warnings

---

## [0.3.0] — 2026-08-04

### Agent-03 — Supabase Storage Foundation

#### Added
- `services/storage.service.ts`, API routes for files, `docs/storage-setup.md`

#### Modified
- `types/index.ts`, `lib/constants.ts`, `lib/validation.ts`

---

## [0.2.1] — 2026-08-04

### Agent-02 — Security Audit & Hardening

#### Fixed
- **Open Redirect (CWE-601)** — `sanitizeRedirectPath()` in `lib/validation.ts`
- **Missing server-side input validation** — all Server Actions now validate inputs

---

## [0.2.0] — 2026-08-04

### Agent-02 — Authentication & User System

#### Added
- `proxy.ts`, auth pages/actions, protected route group, Dashboard, Profile
- `useAuth` hook, `auth.service.ts`

---

## [0.1.0] — 2026-08-04

### Agent-01 — Foundation

#### Added
- Bootstrapped Next.js 16 with TypeScript, Tailwind CSS v4, App Router
- ESLint, Prettier, dark theme, responsive layout
- Supabase browser/server/middleware clients
- Reusable UI and layout components
- Custom hooks, utilities, constants, global types
