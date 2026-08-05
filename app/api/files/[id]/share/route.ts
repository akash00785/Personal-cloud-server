// =============================================================
// POST /api/files/[id]/share  — create a new share link
// GET  /api/files/[id]/share  — list share links for a file
// =============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createShareLink, listShareLinks } from '@/services/share.service';
import type { ApiResponse, ShareLinkItem, ShareExpiry } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

const VALID_EXPIRY: readonly ShareExpiry[] = ['1h', '24h', '7d', 'never'];

// ─── POST ─────────────────────────────────────────────────────────────────────

export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<ShareLinkItem>>> {
  const { id: fileId } = await params;

  if (!fileId) {
    return NextResponse.json(
      { data: null, error: 'File ID is required.', status: 400 },
      { status: 400 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { data: null, error: 'Invalid JSON body.', status: 400 },
      { status: 400 }
    );
  }

  const expiry =
    body !== null &&
    typeof body === 'object' &&
    'expiry' in body &&
    typeof (body as Record<string, unknown>).expiry === 'string'
      ? ((body as Record<string, unknown>).expiry as string)
      : null;

  if (!expiry || !VALID_EXPIRY.includes(expiry as ShareExpiry)) {
    return NextResponse.json(
      {
        data: null,
        error: `Invalid expiry. Must be one of: ${VALID_EXPIRY.join(', ')}.`,
        status: 400,
      },
      { status: 400 }
    );
  }

  try {
    const shareLink = await createShareLink(fileId, expiry as ShareExpiry);
    return NextResponse.json({ data: shareLink, error: null, status: 201 }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create share link.';

    if (message.startsWith('Unauthorized')) {
      return NextResponse.json({ data: null, error: message, status: 401 }, { status: 401 });
    }
    if (message === 'File not found.') {
      return NextResponse.json({ data: null, error: message, status: 404 }, { status: 404 });
    }

    return NextResponse.json({ data: null, error: message, status: 500 }, { status: 500 });
  }
}

// ─── GET ──────────────────────────────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<ShareLinkItem[]>>> {
  const { id: fileId } = await params;

  if (!fileId) {
    return NextResponse.json(
      { data: null, error: 'File ID is required.', status: 400 },
      { status: 400 }
    );
  }

  try {
    const links = await listShareLinks(fileId);
    return NextResponse.json({ data: links, error: null, status: 200 }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to list share links.';

    if (message.startsWith('Unauthorized')) {
      return NextResponse.json({ data: null, error: message, status: 401 }, { status: 401 });
    }

    return NextResponse.json({ data: null, error: message, status: 500 }, { status: 500 });
  }
}
