# Changelog

All notable changes to this project will be documented in this file.

---

## [0.4.0] — 2026-08-04

### Agent-04 — File Manager UI

#### Added
- **`hooks/useFiles.ts`** — Client-side data hook:
  - `fetchFiles()` — manual refresh, resets loading state then re-fetches
  - `removeFile(id)` — DELETE `/api/files/[id]`, removes from local state on success
  - `downloadFile(id, fileName)` — GET `/api/files/[id]` → signed URL → browser download
  - Pattern: all setState calls are inside `.then()/.catch()` callbacks (never synchronous inside useEffect body — satisfies `react-hooks/set-state-in-effect`)
- **`hooks/useFileUpload.ts`** — Multiple file upload with per-file XHR progress tracking:
  - `upload(files)` — sequential XHR uploads; each file gets its own progress 0–100
  - Calls `onComplete()` callback after any successful upload (triggers file list refresh)
  - Auto-clears completed items from the queue after 3 s
  - Exposes `hasActive` flag to disable the upload zone during active uploads
- **`components/files/FileIcon.tsx`** — Colour-coded SVG icon component:
  - 10 MIME-type categories (image, video, audio, pdf, document, spreadsheet, presentation, archive, code, text)
  - `FileIcon` renders the icon; `getMimeLabel()` returns a short type label (e.g. "DOCX", "MP4")
- **`components/files/UploadZone.tsx`** — Accessible drag & drop upload zone:
  - Keyboard accessible (`Enter`/`Space` opens file picker)
  - Drag counter ref prevents flicker on drag-over child elements
  - Hidden `<input type="file" multiple>` with `ACCEPTED_FILE_TYPES` constraint
  - Disables itself while uploads are active
- **`components/files/UploadQueue.tsx`** — Per-file upload progress display:
  - Progress bar (0–100 %) with animated fill for each uploading file
  - Status icons: spinner → success check → error × per item
  - Inline error message per failed item
  - Summary header counts active / done / failed files
  - "Clear" button dismisses the queue once all uploads finish
- **`components/files/FileCard.tsx`** — Grid view card:
  - Large file icon, type badge, truncated name, size, upload date
  - Download + delete action buttons; fade in on hover (always visible on touch)
  - Download error shown inline with auto-clear after 4 s
- **`components/files/FileRow.tsx`** — List view row:
  - Responsive: name always visible; type + size hidden on xs; date hidden on sm
  - Same download/delete actions as FileCard
- **`components/files/FileToolbar.tsx`** — Search, sort, and view-mode controls:
  - Search by file name (live filter, clear button)
  - Sort by Name / Size / Date (segmented button group)
  - Sort direction toggle (asc ↕ desc) with descriptive `aria-label`
  - Grid / List view toggle with `aria-pressed` states
  - Live file count via `aria-live`
- **`components/files/DeleteDialog.tsx`** — Accessible confirmation modal:
  - Focuses cancel button on open (via `requestAnimationFrame` in useEffect — DOM side-effect only, no setState)
  - Closes on Escape key (disabled while deleting)
  - Backdrop click dismisses
  - Inline error if deletion fails
- **`app/(protected)/files/page.tsx`** — File Manager page at `/files`:
  - Page header with file count + total size
  - Refresh button with spinning icon while loading
  - Collapsible upload zone (toggle button)
  - Loading / Error / Empty / No-results states
  - Grid view and List view
  - Client-side search (by name) + sort (name/size/date, asc/desc)
  - `DeleteDialog` keyed by file ID to reset state on each open

#### Modified
- **`types/index.ts`** — Added `SortField`, `SortOrder`, `ViewMode`, `UploadingFile` types

#### Quality
- **Build** — zero errors, zero TypeScript errors
- **ESLint** — zero errors, zero warnings
- **Security** — no new API surface; all file operations flow through existing hardened API routes

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
- **`docs/storage-setup.md`** — Complete SQL guide for `file_metadata` table, Storage bucket, RLS policies
- **`.env.example`** — Documents all required environment variables including the server-only `SUPABASE_SERVICE_ROLE_KEY`

#### Modified
- **`types/index.ts`** — Added `FileMetadataRow`, `UploadResult`, `FileListItem`, `FileValidationResult` interfaces
- **`lib/constants.ts`** — Added `STORAGE_BUCKET`, strongly-typed `ALLOWED_MIME_TYPES` array, `SIGNED_URL_EXPIRY_SECONDS`
- **`lib/validation.ts`** — Added `isValidFileName`, `isAllowedMimeType`, `isAllowedFileSize`, `validateUploadedFile`

#### Security
- Three-layer user isolation: storage path prefix `{userId}/…` + Storage RLS + `file_metadata` RLS
- Application-level ownership double-check in `deleteFile` and `getSignedDownloadUrl`
- File name sanitisation prevents path traversal
- MIME type allowlist enforced at validation layer and Storage bucket config
- 100 MB file size cap at validation layer and Storage bucket config

---

## [0.2.1] — 2026-08-04

### Agent-02 — Security Audit & Hardening

#### Fixed
- **Open Redirect (CWE-601)** — `sanitizeRedirectPath()` in `lib/validation.ts`
- **Missing server-side input validation** — all Server Actions now validate inputs

#### Added
- **`lib/validation.ts`** — `isValidEmail`, `isValidPassword`, `isValidDisplayName`, `isValidAvatarUrl`, `sanitizeRedirectPath`

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
