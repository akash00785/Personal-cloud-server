// =============================================================
// GET  /api/files  — list authenticated user's files
// =============================================================

import { NextResponse } from 'next/server';
import { listUserFiles } from '@/services/storage.service';
import type { ApiResponse, FileListItem } from '@/types';

export async function GET(): Promise<NextResponse<ApiResponse<FileListItem[]>>> {
  try {
    const files = await listUserFiles();
    return NextResponse.json({ data: files, error: null, status: 200 }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to list files.';

    if (message.startsWith('Unauthorized')) {
      return NextResponse.json({ data: null, error: message, status: 401 }, { status: 401 });
    }

    return NextResponse.json({ data: null, error: message, status: 500 }, { status: 500 });
  }
}
