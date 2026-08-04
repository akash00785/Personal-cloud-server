// =============================================================
// Folder service — CRUD operations for the `folders` table.
// All methods require an authenticated server Supabase client.
// User isolation is enforced via RLS (owner_id = auth.uid()).
// =============================================================

import { createClient } from '@/lib/supabase/server';
import { isValidFolderName } from '@/lib/validation';
import type { FolderItem, FolderRow, BreadcrumbItem } from '@/types';

// ─── Mapper ──────────────────────────────────────────────────────────────────

function toFolderItem(row: FolderRow): FolderItem {
  return {
    id: row.id,
    name: row.name,
    parentId: row.parent_id,
    ownerId: row.owner_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── Create ──────────────────────────────────────────────────────────────────

/**
 * Create a new folder owned by the authenticated user.
 *
 * @param name     - Human-readable folder name (will be trimmed)
 * @param parentId - UUID of the parent folder, or null for root
 */
export async function createFolder(
  name: string,
  parentId: string | null = null
): Promise<FolderItem> {
  const trimmedName = name.trim();
  const validation = isValidFolderName(trimmedName);
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized: no active session.');
  }

  // If a parentId is given, verify the parent exists and belongs to this user.
  if (parentId !== null) {
    const { data: parent, error: parentError } = await supabase
      .from('folders')
      .select('id')
      .eq('id', parentId)
      .eq('owner_id', user.id)
      .single();

    if (parentError || !parent) {
      throw new Error('Parent folder not found.');
    }
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('folders')
    .insert({
      owner_id: user.id,
      name: trimmedName,
      parent_id: parentId,
      created_at: now,
      updated_at: now,
    })
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(`Failed to create folder: ${error?.message ?? 'unknown error'}`);
  }

  return toFolderItem(data as FolderRow);
}

// ─── List ─────────────────────────────────────────────────────────────────────

/**
 * List all folders in a given parent (or root if parentId is null)
 * owned by the authenticated user, ordered alphabetically by name.
 *
 * @param parentId - UUID of the parent folder, or null for root-level folders
 */
export async function listFolders(parentId: string | null = null): Promise<FolderItem[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized: no active session.');
  }

  let query = supabase
    .from('folders')
    .select('*')
    .eq('owner_id', user.id)
    .order('name', { ascending: true });

  if (parentId === null) {
    query = query.is('parent_id', null);
  } else {
    query = query.eq('parent_id', parentId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to list folders: ${error.message}`);
  }

  return (data as FolderRow[]).map(toFolderItem);
}

// ─── Rename ──────────────────────────────────────────────────────────────────

/**
 * Rename a folder owned by the authenticated user.
 *
 * @param id      - UUID of the folder to rename
 * @param newName - New name for the folder (will be trimmed)
 */
export async function renameFolder(id: string, newName: string): Promise<FolderItem> {
  const trimmedName = newName.trim();
  const validation = isValidFolderName(trimmedName);
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized: no active session.');
  }

  const { data, error } = await supabase
    .from('folders')
    .update({ name: trimmedName, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('owner_id', user.id)
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(`Failed to rename folder: ${error?.message ?? 'Folder not found.'}`);
  }

  return toFolderItem(data as FolderRow);
}

// ─── Delete ──────────────────────────────────────────────────────────────────

/**
 * Delete a folder and cascade-nullify file_metadata.folder_id for files
 * inside it (files remain, just become root-level).
 *
 * **The DB foreign key uses ON DELETE SET NULL, so child files are
 * automatically moved to root. Child sub-folders are deleted by CASCADE
 * defined in the DB schema (see docs/folder-setup.md).**
 *
 * @param id - UUID of the folder to delete
 */
export async function deleteFolder(id: string): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized: no active session.');
  }

  // RLS will also enforce ownership; this is defence-in-depth.
  const { data: existing, error: fetchError } = await supabase
    .from('folders')
    .select('id, owner_id')
    .eq('id', id)
    .single();

  if (fetchError || !existing) {
    throw new Error('Folder not found.');
  }

  if ((existing.owner_id as string) !== user.id) {
    throw new Error('Forbidden: you do not own this folder.');
  }

  const { error } = await supabase
    .from('folders')
    .delete()
    .eq('id', id)
    .eq('owner_id', user.id);

  if (error) {
    throw new Error(`Failed to delete folder: ${error.message}`);
  }
}

// ─── Breadcrumb path ─────────────────────────────────────────────────────────

/**
 * Build the breadcrumb trail from root to the given folder.
 * Returns an array starting with the root crumb (id: null) and ending
 * with the target folder.
 *
 * @param folderId - UUID of the current folder
 */
export async function getFolderPath(folderId: string): Promise<BreadcrumbItem[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized: no active session.');
  }

  // Walk up the tree iteratively (prevents infinite loops).
  const MAX_DEPTH = 20;
  const crumbs: BreadcrumbItem[] = [];
  let currentId: string | null = folderId;

  for (let depth = 0; depth < MAX_DEPTH && currentId !== null; depth++) {
    const { data, error } = await supabase
      .from('folders')
      .select('id, name, parent_id, owner_id')
      .eq('id', currentId)
      .eq('owner_id', user.id)
      .single();

    if (error || !data) break;

    crumbs.unshift({ id: data.id as string, name: data.name as string });
    currentId = data.parent_id as string | null;
  }

  // Prepend the root crumb
  crumbs.unshift({ id: null, name: 'Files' });

  return crumbs;
}
