// =============================================================
// GET  /api/files  — list authenticated user's files
// Query params:
//   folderId=<uuid>  — filter by folder (omit = all files, "root" = no folder)
// =============================================================

import { NextRequest, NextResponse } from 'next/server';
import { listUserFiles } from '@/services/storage.service';
import type { ApiResponse, FileListItem } from '@/types';

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<FileListItem[]>>> {
  try {
    const { searchParams } = new URL(request.url);
    const folderIdParam = searchParams.get('folderId');

    // undefined  → return all files (no filter — backward-compatible default)
    // "root"     → return only root-level files (folder_id IS NULL)
    // "<uuid>"   → return files in that folder
    let folderId: string | null | undefined;
    if (folderIdParam === null) {
      folderId = undefined;
    } else if (folderIdParam === 'root') {
      folderId = null;
    } else {
      folderId = folderIdParam;
    }

    const files = await listUserFiles(folderId);
    return NextResponse.json({ data: files, error: null, status: 200 }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to list files.';

    if (message.startsWith('Unauthorized')) {
      return NextResponse.json({ data: null, error: message, status: 401 }, { status: 401 });
    }

    return NextResponse.json({ data: null, error: message, status: 500 }, { status: 500 });
  }
}
