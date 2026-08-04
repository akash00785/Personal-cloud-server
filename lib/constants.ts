// =============================================================
// App-wide constants
// =============================================================

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'Personal Cloud Server';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Files', href: '/files' },
  { label: 'Settings', href: '/settings' },
] as const;

// ---------- Auth ----------
export const AUTH_ROUTES = {
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  CALLBACK: '/auth/callback',
} as const;

export const PROTECTED_ROUTES = ['/dashboard', '/files', '/profile', '/settings'] as const;

// ---------- Storage ----------

/** Supabase Storage bucket name */
export const STORAGE_BUCKET = 'personal-files';

/** Maximum allowed upload size (100 MB) */
export const MAX_UPLOAD_SIZE_MB = 100;
export const MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024;

/**
 * Allowed MIME types for file uploads.
 * Keep in sync with the Supabase bucket allowed_mime_types setting.
 */
export const ALLOWED_MIME_TYPES: readonly string[] = [
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp',
  'image/tiff',
  // Video
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
  'video/x-msvideo',
  // Audio
  'audio/mpeg',
  'audio/ogg',
  'audio/wav',
  'audio/webm',
  'audio/flac',
  'audio/aac',
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  // Archives
  'application/zip',
  'application/x-7z-compressed',
  'application/x-tar',
  'application/gzip',
  'application/x-rar-compressed',
  // Text
  'text/plain',
  'text/csv',
  'text/markdown',
  'text/html',
  'text/css',
  'text/javascript',
  'application/json',
  'application/xml',
  'text/xml',
] as const;

/**
 * Accept string for <input type="file"> — browser-facing only.
 * Derived from ALLOWED_MIME_TYPES for consistency.
 */
export const ACCEPTED_FILE_TYPES = ALLOWED_MIME_TYPES.join(',');

/** Signed URL expiry in seconds (1 hour) */
export const SIGNED_URL_EXPIRY_SECONDS = 60 * 60;
