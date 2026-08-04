// =============================================================
// Shared input validation utilities (server-safe, no side-effects)
// =============================================================

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
