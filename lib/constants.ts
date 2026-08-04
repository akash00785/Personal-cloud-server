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

export const ACCEPTED_FILE_TYPES = [
  'image/*',
  'video/*',
  'audio/*',
  'application/pdf',
  'application/zip',
  'text/*',
];

export const MAX_UPLOAD_SIZE_MB = 100;
export const MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024;
