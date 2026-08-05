// =============================================================
// Share service — secure file sharing operations.
//
// Authenticated operations (createShareLink, listShareLinks,
// revokeShareLink) use the server Supabase client + RLS.
//
// Public operation (resolveShareToken) uses the admin client
// to bypass RLS so unauthenticated users can access shared files.
// =============================================================

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  APP_URL,
  SHARE_EXPIRY_MS,
  STORAGE_BUCKET,
  SHARE_DOWNLOAD_URL_EXPIRY_SECONDS,
} from '@/lib/constants';
import type { ShareLinkRow, ShareLinkItem, ShareExpiry, ShareStatus } from '@/types';
import { randomUUID } from 'crypto';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function computeShareStatus(expiresAt: string | null, revokedAt: string | null): ShareStatus {
  if (revokedAt !== null) return 'revoked';
  if (expiresAt !== null && new Date(expiresAt) <= new Date()) return 'expired';
  return 'active';
}

function rowToItem(row: ShareLinkRow): ShareLinkItem {
  return {
    id: row.id,
    fileId: row.file_id,
    token: row.token,
    expiresAt: row.expires_at,
    revokedAt: row.revoked_at,
    createdAt: row.created_at,
    status: computeShareStatus(row.expires_at, row.revoked_at),
    shareUrl: `${APP_URL}/share/${row.token}`,
  };
}

// ─── Create ───────────────────────────────────────────────────────────────────

/**
 * Create a new share link for a file owned by the authenticated user.
 *
 * @param fileId - UUID of the `file_metadata` row to share
 * @param expiry - Expiry duration ('1h' | '24h' | '7d' | 'never')
 * @returns The newly created ShareLinkItem
 */
export async function createShareLink(
  fileId: string,
  expiry: ShareExpiry
): Promise<ShareLinkItem> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized: no active session.');
  }

  // Verify file ownership via RLS + explicit check
  const { data: file, error: fileError } = await supabase
    .from('file_metadata')
    .select('id, owner_id')
    .eq('id', fileId)
    .eq('owner_id', user.id)
    .single();

  if (fileError || !file) {
    throw new Error('File not found.');
  }

  const token = randomUUID();
  const expiryMs = SHARE_EXPIRY_MS[expiry] ?? null;
  const expiresAt = expiryMs !== null ? new Date(Date.now() + expiryMs).toISOString() : null;

  const { data, error } = await supabase
    .from('file_shares')
    .insert({
      file_id: fileId,
      owner_id: user.id,
      token,
      expires_at: expiresAt,
    })
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(`Failed to create share link: ${error?.message ?? 'unknown error'}`);
  }

  return rowToItem(data as ShareLinkRow);
}

// ─── List ─────────────────────────────────────────────────────────────────────

/**
 * List all share links for a specific file owned by the authenticated user.
 * Returns links ordered by creation date (newest first).
 *
 * @param fileId - UUID of the `file_metadata` row
 * @returns Array of ShareLinkItem; empty array if none found
 */
export async function listShareLinks(fileId: string): Promise<ShareLinkItem[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized: no active session.');
  }

  const { data, error } = await supabase
    .from('file_shares')
    .select('*')
    .eq('file_id', fileId)
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to list share links: ${error.message}`);
  }

  return (data as ShareLinkRow[]).map(rowToItem);
}

// ─── Revoke ───────────────────────────────────────────────────────────────────

/**
 * Revoke a share link by setting its `revoked_at` timestamp.
 * Only the owner can revoke their own share links.
 *
 * @param shareId - UUID of the `file_shares` row to revoke
 */
export async function revokeShareLink(shareId: string): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized: no active session.');
  }

  const { error } = await supabase
    .from('file_shares')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', shareId)
    .eq('owner_id', user.id);

  if (error) {
    throw new Error(`Failed to revoke share link: ${error.message}`);
  }
}

// ─── Public resolve ───────────────────────────────────────────────────────────

export interface ResolvedShare {
  shareId: string;
  fileId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  signedUrl: string;
  expiresAt: string | null;
}

/**
 * Resolve a public share token to file information and a temporary signed URL.
 * Uses the admin client (service role) to bypass RLS — no auth cookie required.
 *
 * @param token - The UUID share token from the URL
 * @returns Resolved share data including a short-lived signed download URL
 * @throws {Error} if the token is invalid, expired, or revoked
 */
export async function resolveShareToken(token: string): Promise<ResolvedShare> {
  const admin = createAdminClient();

  // Look up the share by token
  const { data: share, error: shareError } = await admin
    .from('file_shares')
    .select('*')
    .eq('token', token)
    .single();

  if (shareError || !share) {
    throw new Error('Share link not found.');
  }

  const shareRow = share as ShareLinkRow;

  if (shareRow.revoked_at !== null) {
    throw new Error('This share link has been revoked.');
  }

  if (shareRow.expires_at !== null && new Date(shareRow.expires_at) <= new Date()) {
    throw new Error('This share link has expired.');
  }

  // Fetch file metadata
  const { data: file, error: fileError } = await admin
    .from('file_metadata')
    .select('id, file_name, file_size, mime_type, storage_path')
    .eq('id', shareRow.file_id)
    .single();

  if (fileError || !file) {
    throw new Error('Shared file not found.');
  }

  // Generate a short-lived signed URL for download
  const { data: signedData, error: signError } = await admin.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(file.storage_path as string, SHARE_DOWNLOAD_URL_EXPIRY_SECONDS);

  if (signError || !signedData) {
    throw new Error('Failed to generate download URL.');
  }

  return {
    shareId: shareRow.id,
    fileId: shareRow.file_id,
    fileName: file.file_name as string,
    fileSize: file.file_size as number,
    mimeType: file.mime_type as string,
    signedUrl: signedData.signedUrl,
    expiresAt: shareRow.expires_at,
  };
}
