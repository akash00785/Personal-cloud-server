// =============================================================
// Global TypeScript types
// =============================================================

// ---------- Utility ----------
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncFn<T = void> = () => Promise<T>;

// ---------- API / Response ----------
export interface ApiResponse<T = unknown> {
  data: T | null;
  error: string | null;
  status: number;
}

// ---------- User / Auth ----------
export interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

/** Shape of a row in the `profiles` table */
export interface ProfileRow {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// ---------- File / Storage ----------

/** Application-level file object (camelCase) */
export interface CloudFile {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  path: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

/** Shape of a row in the `file_metadata` table */
export interface FileMetadataRow {
  id: string;
  owner_id: string;
  storage_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  folder_id: string | null;
  created_at: string;
  updated_at: string;
}

/** Result returned after a successful file upload */
export interface UploadResult {
  id: string;
  storagePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
}

/** Item returned in a file listing */
export interface FileListItem {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  storagePath: string;
  folderId: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Validation result for file upload checks */
export interface FileValidationResult {
  valid: boolean;
  message: string;
}

// ---------- File Manager UI ----------

/** Sort field for the file manager */
export type SortField = 'name' | 'size' | 'date';

/** Sort direction */
export type SortOrder = 'asc' | 'desc';

/** View mode for the file manager */
export type ViewMode = 'grid' | 'list';

/** A file currently being uploaded, with progress tracking */
export interface UploadingFile {
  /** Locally unique ID for tracking this upload in the queue */
  id: string;
  name: string;
  size: number;
  /** Upload progress 0–100 */
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
}

// ---------- Folder System ----------

/** Shape of a row in the `folders` table */
export interface FolderRow {
  id: string;
  owner_id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

/** Application-level folder object (camelCase) */
export interface FolderItem {
  id: string;
  name: string;
  parentId: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

/** A single crumb in a breadcrumb navigation trail */
export interface BreadcrumbItem {
  /** null represents the root (Files) level */
  id: string | null;
  name: string;
}

// ---------- File Sharing ----------

/** Expiry duration options for share links */
export type ShareExpiry = '1h' | '24h' | '7d' | 'never';

/** Status of a share link */
export type ShareStatus = 'active' | 'expired' | 'revoked';

/** Shape of a row in the `file_shares` table */
export interface ShareLinkRow {
  id: string;
  file_id: string;
  owner_id: string;
  token: string;
  expires_at: string | null;
  revoked_at: string | null;
  created_at: string;
}

/** Resolved data for a public share token */
export interface ResolvedShare {
  shareId: string;
  fileId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  signedUrl: string;
  expiresAt: string | null;
}

/** Application-level share link object (camelCase) */
export interface ShareLinkItem {
  id: string;
  fileId: string;
  token: string;
  expiresAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  status: ShareStatus;
  shareUrl: string;
}

// ---------- Navigation ----------
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
}
