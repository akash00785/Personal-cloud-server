// =============================================================
// Storage service — Supabase Storage operations.
// All methods require an authenticated server Supabase client.
// User isolation is enforced via storage paths: {userId}/{uuid}-{filename}
// and backed by RLS policies on the storage bucket.
// =============================================================

import { createClient } from '@/lib/supabase/server';
import { STORAGE_BUCKET, SIGNED_URL_EXPIRY_SECONDS } from '@/lib/constants';
import { validateUploadedFile } from '@/lib/validation';
import type { UploadResult, FileListItem, FileMetadataRow } from '@/types';
import { randomUUID } from 'crypto';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Build the storage path for a user's file.
 * Pattern: {userId}/{uuid}-{sanitisedFileName}
 * The userId prefix is the primary user-isolation mechanism at the storage layer.
 */
function buildStoragePath(userId: string, fileName: string): string {
  const uuid = randomUUID();
  // Strip any path separators from the original name to prevent traversal
  const safeName = fileName.replace(/[/\\]/g, '_');
  return `${userId}/${uuid}-${safeName}`;
}

// ─── Upload ──────────────────────────────────────────────────────────────────

/**
 * Upload a file to Supabase Storage and persist metadata to the
 * `file_metadata` table.
 *
 * @param fileBuffer - Raw file bytes
 * @param fileName   - Original file name provided by the client
 * @param mimeType   - MIME type of the file
 * @param fileSize   - File size in bytes
 * @returns UploadResult on success, throws on failure
 */
export async function uploadFile(
  fileBuffer: ArrayBuffer,
  fileName: string,
  mimeType: string,
  fileSize: number
): Promise<UploadResult> {
  // ── Validate ──────────────────────────────────────────────────────────────
  const validation = validateUploadedFile(fileName, mimeType, fileSize);
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  const supabase = await createClient();

  // ── Authenticate ──────────────────────────────────────────────────────────
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized: no active session.');
  }

  // ── Build path & upload to bucket ─────────────────────────────────────────
  const storagePath = buildStoragePath(user.id, fileName);

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Storage upload failed: ${uploadError.message}`);
  }

  // ── Persist metadata ──────────────────────────────────────────────────────
  const now = new Date().toISOString();
  const { data: metadata, error: dbError } = await supabase
    .from('file_metadata')
    .insert({
      owner_id: user.id,
      storage_path: storagePath,
      file_name: fileName,
      file_size: fileSize,
      mime_type: mimeType,
      created_at: now,
      updated_at: now,
    })
    .select('id, created_at')
    .single();

  if (dbError || !metadata) {
    // Roll back the storage upload to prevent orphan files
    await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
    throw new Error(`Metadata insert failed: ${dbError?.message ?? 'unknown error'}`);
  }

  return {
    id: metadata.id as string,
    storagePath,
    fileName,
    fileSize,
    mimeType,
    createdAt: metadata.created_at as string,
  };
}

// ─── List ─────────────────────────────────────────────────────────────────────

/**
 * List all files belonging to the currently authenticated user,
 * ordered by newest first.
 *
 * @returns Array of FileListItem; empty array if none found.
 */
export async function listUserFiles(): Promise<FileListItem[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized: no active session.');
  }

  const { data, error } = await supabase
    .from('file_metadata')
    .select('id, file_name, file_size, mime_type, storage_path, created_at, updated_at')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to list files: ${error.message}`);
  }

  return (data as FileMetadataRow[]).map((row) => ({
    id: row.id,
    fileName: row.file_name,
    fileSize: row.file_size,
    mimeType: row.mime_type,
    storagePath: row.storage_path,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

// ─── Download (Signed URL) ────────────────────────────────────────────────────

/**
 * Generate a temporary signed URL for a file.
 * Verifies that the requesting user owns the file before issuing the URL.
 *
 * @param fileId - UUID of the file_metadata row
 * @returns Signed URL string valid for SIGNED_URL_EXPIRY_SECONDS seconds
 */
export async function getSignedDownloadUrl(fileId: string): Promise<string> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized: no active session.');
  }

  // Fetch metadata — RLS ensures the row belongs to the current user
  const { data: meta, error: metaError } = await supabase
    .from('file_metadata')
    .select('storage_path, owner_id')
    .eq('id', fileId)
    .single();

  if (metaError || !meta) {
    throw new Error('File not found.');
  }

  // Double-check ownership in application code (defence-in-depth)
  if ((meta.owner_id as string) !== user.id) {
    throw new Error('Forbidden: you do not own this file.');
  }

  const { data: signedData, error: signedError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(meta.storage_path as string, SIGNED_URL_EXPIRY_SECONDS);

  if (signedError || !signedData?.signedUrl) {
    throw new Error(`Failed to generate download URL: ${signedError?.message ?? 'unknown error'}`);
  }

  return signedData.signedUrl;
}

// ─── Delete ───────────────────────────────────────────────────────────────────

/**
 * Delete a file from storage and remove its metadata row.
 * Verifies ownership before deletion (defence-in-depth on top of RLS).
 *
 * @param fileId - UUID of the file_metadata row
 */
export async function deleteFile(fileId: string): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized: no active session.');
  }

  // Fetch metadata — RLS ensures row belongs to current user
  const { data: meta, error: metaError } = await supabase
    .from('file_metadata')
    .select('storage_path, owner_id')
    .eq('id', fileId)
    .single();

  if (metaError || !meta) {
    throw new Error('File not found.');
  }

  // Defence-in-depth ownership check
  if ((meta.owner_id as string) !== user.id) {
    throw new Error('Forbidden: you do not own this file.');
  }

  // Remove from storage bucket
  const { error: storageError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([meta.storage_path as string]);

  if (storageError) {
    throw new Error(`Storage deletion failed: ${storageError.message}`);
  }

  // Remove metadata row
  const { error: dbError } = await supabase
    .from('file_metadata')
    .delete()
    .eq('id', fileId)
    .eq('owner_id', user.id);

  if (dbError) {
    throw new Error(`Metadata deletion failed: ${dbError.message}`);
  }
}
