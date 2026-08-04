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
  createdAt: string;
  updatedAt: string;
}

/** Validation result for file upload checks */
export interface FileValidationResult {
  valid: boolean;
  message: string;
}

// ---------- Navigation ----------
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
}
