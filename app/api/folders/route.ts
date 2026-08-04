// =============================================================
// GET  /api/folders  — list folders for the authenticated user
// POST /api/folders  — create a new folder
//
// GET  query params:
//   parentId=<uuid>  — list children of this folder
//   parentId=root    — list root-level folders (no parent)
//   (omit)           — list root-level folders by default
// =============================================================

import { NextRequest, NextResponse } from 'next/server';
import { listFolders, createFolder } from '@/services/folder.service';
import type { ApiResponse, FolderItem } from '@/types';

// ─── GET ──────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<FolderItem[]>>> {
  try {
    const { searchParams } = new URL(request.url);
    const parentIdParam = searchParams.get('parentId');

    // null / "root" / omitted → root-level folders; otherwise use UUID
    const parentId =
      parentIdParam && parentIdParam !== 'root' ? parentIdParam : null;

    const folders = await listFolders(parentId);
    return NextResponse.json({ data: folders, error: null, status: 200 }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to list folders.';
    if (message.startsWith('Unauthorized')) {
      return NextResponse.json({ data: null, error: message, status: 401 }, { status: 401 });
    }
    return NextResponse.json({ data: null, error: message, status: 500 }, { status: 500 });
  }
}

// ─── POST ─────────────────────────────────────────────────────────────────────

interface CreateFolderBody {
  name: string;
  parentId?: string | null;
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<FolderItem>>> {
  let body: CreateFolderBody;

  try {
    body = (await request.json()) as CreateFolderBody;
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

  const parentId = body.parentId ?? null;

  try {
    const folder = await createFolder(body.name, parentId);
    return NextResponse.json({ data: folder, error: null, status: 201 }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create folder.';

    if (message.startsWith('Unauthorized')) {
      return NextResponse.json({ data: null, error: message, status: 401 }, { status: 401 });
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
    if (message.includes('not found')) {
      return NextResponse.json({ data: null, error: message, status: 404 }, { status: 404 });
    }
    return NextResponse.json({ data: null, error: message, status: 500 }, { status: 500 });
  }
}
