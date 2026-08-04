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
 * @param folderId   - Optional folder UUID to place the file in (null = root)
 * @returns UploadResult on success, throws on failure
 */
export async function uploadFile(
  fileBuffer: ArrayBuffer,
  fileName: string,
  mimeType: string,
  fileSize: number,
  folderId: string | null = null
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

  // ── Verify folder ownership (if provided) ─────────────────────────────────
  if (folderId !== null) {
    const { data: folder, error: folderError } = await supabase
      .from('folders')
      .select('id')
      .eq('id', folderId)
      .eq('owner_id', user.id)
      .single();

    if (folderError || !folder) {
      throw new Error('Target folder not found.');
    }
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
      folder_id: folderId,
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
 * List files belonging to the currently authenticated user.
 *
 * @param folderId - If provided, filter by this folder (null = root files only,
 *                   undefined = return ALL files regardless of folder)
 * @returns Array of FileListItem; empty array if none found.
 */
export async function listUserFiles(folderId?: string | null): Promise<FileListItem[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized: no active session.');
  }

  let query = supabase
    .from('file_metadata')
    .select('id, owner_id, storage_path, file_name, file_size, mime_type, folder_id, created_at, updated_at')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  // Only filter by folder_id when explicitly provided (null = root, undefined = all)
  if (folderId !== undefined) {
    if (folderId === null) {
      query = query.is('folder_id', null);
    } else {
      query = query.eq('folder_id', folderId);
    }
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to list files: ${error.message}`);
  }

  return (data as FileMetadataRow[]).map((row) => ({
    id: row.id,
    fileName: row.file_name,
    fileSize: row.file_size,
    mimeType: row.mime_type,
    storagePath: row.storage_path,
    folderId: row.folder_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

// ─── Signed URL ───────────────────────────────────────────────────────────────

/**
 * Generate a signed download URL for a file owned by the authenticated user.
 * The URL expires after SIGNED_URL_EXPIRY_SECONDS seconds.
 *
 * @param fileId - UUID of the file_metadata row
 * @returns Signed URL string
 */
export async function getSignedDownloadUrl(fileId: string): Promise<string> {
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

  const { data: signedData, error: signError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(meta.storage_path as string, SIGNED_URL_EXPIRY_SECONDS);

  if (signError || !signedData) {
    throw new Error(`Failed to generate signed URL: ${signError?.message ?? 'unknown error'}`);
  }

  return signedData.signedUrl;
}

// ─── Delete ───────────────────────────────────────────────────────────────────

/**
 * Delete a file from Storage and remove its metadata row.
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
