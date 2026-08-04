// =============================================================
// GET    /api/files/[id]  — generate a signed download URL
// DELETE /api/files/[id]  — delete a file owned by the current user
// =============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getSignedDownloadUrl, deleteFile } from '@/services/storage.service';
import type { ApiResponse } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ─── GET ──────────────────────────────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<{ signedUrl: string }>>> {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { data: null, error: 'File ID is required.', status: 400 },
      { status: 400 }
    );
  }

  try {
    const signedUrl = await getSignedDownloadUrl(id);
    return NextResponse.json({ data: { signedUrl }, error: null, status: 200 }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to generate download URL.';

    if (message.startsWith('Unauthorized')) {
      return NextResponse.json({ data: null, error: message, status: 401 }, { status: 401 });
    }
    if (message.startsWith('Forbidden')) {
      return NextResponse.json({ data: null, error: message, status: 403 }, { status: 403 });
    }
    if (message === 'File not found.') {
      return NextResponse.json({ data: null, error: message, status: 404 }, { status: 404 });
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
      { data: null, error: 'File ID is required.', status: 400 },
      { status: 400 }
    );
  }

  try {
    await deleteFile(id);
    return NextResponse.json({ data: null, error: null, status: 200 }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete file.';

    if (message.startsWith('Unauthorized')) {
      return NextResponse.json({ data: null, error: message, status: 401 }, { status: 401 });
    }
    if (message.startsWith('Forbidden')) {
      return NextResponse.json({ data: null, error: message, status: 403 }, { status: 403 });
    }
    if (message === 'File not found.') {
      return NextResponse.json({ data: null, error: message, status: 404 }, { status: 404 });
    }

    return NextResponse.json({ data: null, error: message, status: 500 }, { status: 500 });
  }
}
