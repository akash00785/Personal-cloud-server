// =============================================================
// Shared input validation utilities (server-safe, no side-effects)
// =============================================================

import { ALLOWED_MIME_TYPES, MAX_UPLOAD_SIZE_BYTES } from '@/lib/constants';
import type { FileValidationResult } from '@/types';

/** Validate an email address format (RFC 5322 simplified). */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/** Ensure a password meets the minimum security requirements. */
export function isValidPassword(password: string): { valid: boolean; message: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters.' };
  }
  return { valid: true, message: '' };
}

/** Ensure a display name is safe (non-empty, max 80 chars, no control chars). */
export function isValidDisplayName(name: string): { valid: boolean; message: string } {
  const trimmed = name.trim();
  if (trimmed.length === 0) return { valid: false, message: 'Display name cannot be empty.' };
  if (trimmed.length > 80) return { valid: false, message: 'Display name is too long (max 80 chars).' };
  // Reject control characters
  if (/[\x00-\x1f\x7f]/.test(trimmed)) {
    return { valid: false, message: 'Display name contains invalid characters.' };
  }
  return { valid: true, message: '' };
}

/**
 * Validate an avatar URL.
 * Must be an absolute HTTPS URL or empty.
 */
export function isValidAvatarUrl(url: string): { valid: boolean; message: string } {
  if (!url || url.trim() === '') return { valid: true, message: '' };
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== 'https:') {
      return { valid: false, message: 'Avatar URL must use HTTPS.' };
    }
    return { valid: true, message: '' };
  } catch {
    return { valid: false, message: 'Avatar URL is not a valid URL.' };
  }
}

/**
 * Guard against open redirect attacks.
 * Accepts only relative paths that start with "/" and do not start with "//".
 * Falls back to the provided default path if validation fails.
 */
export function sanitizeRedirectPath(
  input: string | null | undefined,
  fallback = '/dashboard'
): string {
  if (!input) return fallback;
  const trimmed = input.trim();
  // Must start with "/" but not "//" (protocol-relative URL)
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return fallback;
  // Reject paths that look like they encode a host (e.g. /%2F or /\evil.com)
  if (/^\/[\\%]/.test(trimmed)) return fallback;
  return trimmed;
}

// =============================================================
// File / Storage validation
// =============================================================

/**
 * Validate that a file name is safe.
 * Rejects empty names, names longer than 255 chars,
 * path traversal sequences, and names with only dots.
 */
export function isValidFileName(name: string): FileValidationResult {
  const trimmed = name.trim();
  if (!trimmed) {
    return { valid: false, message: 'File name cannot be empty.' };
  }
  if (trimmed.length > 255) {
    return { valid: false, message: 'File name is too long (max 255 characters).' };
  }
  // Reject path traversal attempts
  if (trimmed.includes('..') || trimmed.includes('/') || trimmed.includes('\\')) {
    return { valid: false, message: 'File name contains invalid characters.' };
  }
  // Reject names consisting entirely of dots
  if (/^\.+$/.test(trimmed)) {
    return { valid: false, message: 'File name is not valid.' };
  }
  // Reject null bytes and other control characters
  if (/[\x00-\x1f\x7f]/.test(trimmed)) {
    return { valid: false, message: 'File name contains invalid characters.' };
  }
  return { valid: true, message: '' };
}

/**
 * Validate that a MIME type is in the allowed list.
 */
export function isAllowedMimeType(mimeType: string): FileValidationResult {
  const normalized = mimeType.toLowerCase().split(';')[0]?.trim() ?? '';
  if (!normalized) {
    return { valid: false, message: 'File type could not be determined.' };
  }
  if (!(ALLOWED_MIME_TYPES as readonly string[]).includes(normalized)) {
    return { valid: false, message: `File type "${normalized}" is not allowed.` };
  }
  return { valid: true, message: '' };
}

/**
 * Validate that a file size does not exceed the maximum allowed size.
 */
export function isAllowedFileSize(sizeBytes: number): FileValidationResult {
  if (sizeBytes <= 0) {
    return { valid: false, message: 'File is empty.' };
  }
  if (sizeBytes > MAX_UPLOAD_SIZE_BYTES) {
    const mb = Math.ceil(sizeBytes / (1024 * 1024));
    const maxMb = MAX_UPLOAD_SIZE_BYTES / (1024 * 1024);
    return {
      valid: false,
      message: `File is too large (${mb} MB). Maximum allowed size is ${maxMb} MB.`,
    };
  }
  return { valid: true, message: '' };
}

/**
 * Run all file validations in sequence.
 * Returns the first failure, or a passing result if all checks pass.
 */
export function validateUploadedFile(
  fileName: string,
  mimeType: string,
  sizeBytes: number
): FileValidationResult {
  const nameCheck = isValidFileName(fileName);
  if (!nameCheck.valid) return nameCheck;

  const typeCheck = isAllowedMimeType(mimeType);
  if (!typeCheck.valid) return typeCheck;

  const sizeCheck = isAllowedFileSize(sizeBytes);
  if (!sizeCheck.valid) return sizeCheck;

  return { valid: true, message: '' };
}
