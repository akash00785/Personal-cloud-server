// =============================================================
// GET /api/folders/[id]/path — get breadcrumb trail for a folder
// Returns: BreadcrumbItem[] from root → target folder
// =============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getFolderPath } from '@/services/folder.service';
import type { ApiResponse, BreadcrumbItem } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<BreadcrumbItem[]>>> {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { data: null, error: 'Folder ID is required.', status: 400 },
      { status: 400 }
    );
  }

  try {
    const path = await getFolderPath(id);
    return NextResponse.json({ data: path, error: null, status: 200 }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to get folder path.';

    if (message.startsWith('Unauthorized')) {
      return NextResponse.json({ data: null, error: message, status: 401 }, { status: 401 });
    }
    return NextResponse.json({ data: null, error: message, status: 500 }, { status: 500 });
  }
}
