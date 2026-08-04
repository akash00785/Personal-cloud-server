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

// ---------- File / Storage (future) ----------
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

// ---------- Navigation ----------
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
}
