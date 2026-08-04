// =============================================================
// POST /api/files/upload — upload a file for the authenticated user
// Expects multipart/form-data with a single "file" field.
// =============================================================

import { NextRequest, NextResponse } from 'next/server';
import { uploadFile } from '@/services/storage.service';
import type { ApiResponse, UploadResult } from '@/types';

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<UploadResult>>> {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { data: null, error: 'Invalid request: expected multipart/form-data.', status: 400 },
      { status: 400 }
    );
  }

  const file = formData.get('file');

  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { data: null, error: 'No file provided. Include a "file" field in the form data.', status: 400 },
      { status: 400 }
    );
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await uploadFile(arrayBuffer, file.name, file.type, file.size);

    return NextResponse.json({ data: result, error: null, status: 201 }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Upload failed.';

    if (message.startsWith('Unauthorized')) {
      return NextResponse.json({ data: null, error: message, status: 401 }, { status: 401 });
    }

    if (
      message.includes('too large') ||
      message.includes('not allowed') ||
      message.includes('cannot be empty') ||
      message.includes('invalid characters') ||
      message.includes('not valid')
    ) {
      return NextResponse.json({ data: null, error: message, status: 422 }, { status: 422 });
    }

    return NextResponse.json({ data: null, error: message, status: 500 }, { status: 500 });
  }
}
