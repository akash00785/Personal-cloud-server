// =============================================================
// DELETE /api/files/[id]/share/[shareId] — revoke a share link
// =============================================================

import { NextRequest, NextResponse } from 'next/server';
import { revokeShareLink } from '@/services/share.service';
import type { ApiResponse } from '@/types';

interface RouteParams {
  params: Promise<{ id: string; shareId: string }>;
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<null>>> {
  const { shareId } = await params;

  if (!shareId) {
    return NextResponse.json(
      { data: null, error: 'Share ID is required.', status: 400 },
      { status: 400 }
    );
  }

  try {
    await revokeShareLink(shareId);
    return NextResponse.json({ data: null, error: null, status: 200 }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to revoke share link.';

    if (message.startsWith('Unauthorized')) {
      return NextResponse.json({ data: null, error: message, status: 401 }, { status: 401 });
    }

    return NextResponse.json({ data: null, error: message, status: 500 }, { status: 500 });
  }
}
