// =============================================================
// PATCH  /api/folders/[id]  — rename a folder
// DELETE /api/folders/[id]  — delete a folder
// =============================================================

import { NextRequest, NextResponse } from 'next/server';
import { renameFolder, deleteFolder } from '@/services/folder.service';
import type { ApiResponse, FolderItem } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ─── PATCH ────────────────────────────────────────────────────────────────────

interface RenameFolderBody {
  name: string;
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<FolderItem>>> {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { data: null, error: 'Folder ID is required.', status: 400 },
      { status: 400 }
    );
  }

  let body: RenameFolderBody;
  try {
    body = (await request.json()) as RenameFolderBody;
  } catch {
    return NextResponse.json(
      { data: null, error: 'Invalid JSON body.', status: 400 },
      { status: 400 }
    );
  }

  if (!body.name || typeof body.name !== 'string') {
    return NextResponse.json(
      { data: null, error: 'Folder name is required.', status: 400 },
      { status: 400 }
    );
  }

  try {
    const folder = await renameFolder(id, body.name);
    return NextResponse.json({ data: folder, error: null, status: 200 }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to rename folder.';

    if (message.startsWith('Unauthorized')) {
      return NextResponse.json({ data: null, error: message, status: 401 }, { status: 401 });
    }
    if (message.startsWith('Forbidden')) {
      return NextResponse.json({ data: null, error: message, status: 403 }, { status: 403 });
    }
    if (message.includes('not found') || message.includes('not found.')) {
      return NextResponse.json({ data: null, error: message, status: 404 }, { status: 404 });
    }
    if (
      message.includes('cannot be empty') ||
      message.includes('too long') ||
      message.includes('not valid') ||
      message.includes('invalid characters') ||
      message.includes('slashes')
    ) {
      return NextResponse.json({ data: null, error: message, status: 422 }, { status: 422 });
    }
    return NextResponse.json({ data: null, error: message, status: 500 }, { status: 500 });
  }
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<null>>> {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { data: null, error: 'Folder ID is required.', status: 400 },
      { status: 400 }
    );
  }

  try {
    await deleteFolder(id);
    return NextResponse.json({ data: null, error: null, status: 200 }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete folder.';

    if (message.startsWith('Unauthorized')) {
      return NextResponse.json({ data: null, error: message, status: 401 }, { status: 401 });
    }
    if (message.startsWith('Forbidden')) {
      return NextResponse.json({ data: null, error: message, status: 403 }, { status: 403 });
    }
    if (message === 'Folder not found.') {
      return NextResponse.json({ data: null, error: message, status: 404 }, { status: 404 });
    }
    return NextResponse.json({ data: null, error: message, status: 500 }, { status: 500 });
  }
}
