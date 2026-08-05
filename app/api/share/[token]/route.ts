// =============================================================
// GET /api/share/[token] — public endpoint to resolve a share token.
// No authentication required — the token itself is the credential.
// Uses admin client (service role) to bypass RLS.
// =============================================================

import { NextRequest, NextResponse } from 'next/server';
import { resolveShareToken } from '@/services/share.service';
import type { ApiResponse, ResolvedShare } from '@/types';

interface RouteParams {
  params: Promise<{ token: string }>;
}

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<ResolvedShare>>> {
  const { token } = await params;

  if (!token) {
    return NextResponse.json(
      { data: null, error: 'Share token is required.', status: 400 },
      { status: 400 }
    );
  }

  try {
    const resolved = await resolveShareToken(token);
    return NextResponse.json({ data: resolved, error: null, status: 200 }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to resolve share link.';

    if (message === 'Share link not found.') {
      return NextResponse.json({ data: null, error: message, status: 404 }, { status: 404 });
    }
    if (
      message === 'This share link has been revoked.' ||
      message === 'This share link has expired.'
    ) {
      return NextResponse.json({ data: null, error: message, status: 410 }, { status: 410 });
    }

    return NextResponse.json({ data: null, error: message, status: 500 }, { status: 500 });
  }
}
