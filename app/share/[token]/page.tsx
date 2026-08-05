// =============================================================
// Public share page — /share/[token]
// No login required. Shows shared file info and download link.
// Edit / Delete actions are intentionally omitted.
// =============================================================

import { resolveShareToken } from '@/services/share.service';
import { APP_NAME } from '@/lib/constants';
import { formatBytes, formatDate } from '@/lib/utils';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;
  try {
    const share = await resolveShareToken(token);
    return {
      title: `${share.fileName} — Shared via ${APP_NAME}`,
      description: `Download ${share.fileName} (${formatBytes(share.fileSize)})`,
    };
  } catch {
    return {
      title: `Shared File — ${APP_NAME}`,
    };
  }
}

// ─── Share icon ───────────────────────────────────────────────────────────────

function ShareIcon(): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-8 w-8 text-blue-400"
      aria-hidden="true"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

// ─── Download icon ────────────────────────────────────────────────────────────

function DownloadIcon(): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

// ─── Error page ───────────────────────────────────────────────────────────────

function ShareErrorPage({ message }: { message: string }): React.JSX.Element {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-red-900 bg-zinc-900 p-8 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-900/30">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-7 w-7 text-red-400"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h1 className="mb-2 text-lg font-semibold text-white">Link Unavailable</h1>
        <p className="text-sm text-zinc-400">{message}</p>
        <p className="mt-4 text-xs text-zinc-600">
          The owner may have revoked or the link may have expired.
        </p>
      </div>
      <p className="mt-6 text-xs text-zinc-600">
        Powered by{' '}
        <span className="text-zinc-500">{APP_NAME}</span>
      </p>
    </div>
  );
}

// ─── MIME label helper ────────────────────────────────────────────────────────

function getMimeLabel(mimeType: string): string {
  const m = mimeType.toLowerCase();
  if (m.startsWith('image/')) return 'Image';
  if (m.startsWith('video/')) return 'Video';
  if (m.startsWith('audio/')) return 'Audio';
  if (m === 'application/pdf') return 'PDF';
  if (m.startsWith('text/')) return 'Text';
  if (m.includes('zip') || m.includes('tar') || m.includes('rar') || m.includes('7z'))
    return 'Archive';
  if (m.includes('word') || m.includes('document')) return 'Document';
  if (m.includes('sheet') || m.includes('excel')) return 'Spreadsheet';
  if (m.includes('presentation') || m.includes('powerpoint')) return 'Presentation';
  return 'File';
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default async function SharePage({ params }: PageProps): Promise<React.JSX.Element> {
  const { token } = await params;

  let share;
  try {
    share = await resolveShareToken(token);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'This share link is no longer available.';
    return <ShareErrorPage message={message} />;
  }

  const mimeLabel = getMimeLabel(share.mimeType);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 py-12">
      {/* Card */}
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-zinc-800 px-6 py-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-900/30">
            <ShareIcon />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Shared File
            </p>
            <p className="text-sm font-medium text-zinc-200">{APP_NAME}</p>
          </div>
        </div>

        {/* File info */}
        <div className="px-6 py-6">
          {/* File icon + name */}
          <div className="mb-5 flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-6 w-6 text-zinc-400"
                aria-hidden="true"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div className="min-w-0">
              <h1
                className="break-all text-base font-semibold leading-snug text-white"
                title={share.fileName}
              >
                {share.fileName}
              </h1>
              <p className="mt-0.5 text-sm text-zinc-500">
                {mimeLabel} · {formatBytes(share.fileSize)}
              </p>
            </div>
          </div>

          {/* Metadata table */}
          <dl className="mb-6 space-y-2 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <dt className="text-xs text-zinc-500">Type</dt>
              <dd className="text-xs font-medium text-zinc-300">{mimeLabel}</dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-xs text-zinc-500">Size</dt>
              <dd className="text-xs font-medium text-zinc-300">{formatBytes(share.fileSize)}</dd>
            </div>
            {share.expiresAt && (
              <div className="flex items-center justify-between gap-2">
                <dt className="text-xs text-zinc-500">Link expires</dt>
                <dd className="text-xs font-medium text-amber-400">
                  {formatDate(share.expiresAt)}
                </dd>
              </div>
            )}
            {!share.expiresAt && (
              <div className="flex items-center justify-between gap-2">
                <dt className="text-xs text-zinc-500">Link expires</dt>
                <dd className="text-xs font-medium text-zinc-300">Never</dd>
              </div>
            )}
          </dl>

          {/* Download button */}
          <a
            href={share.signedUrl}
            download={share.fileName}
            target="_blank"
            rel="noopener noreferrer"
            className={[
              'flex w-full items-center justify-center gap-2 rounded-xl',
              'bg-blue-600 px-4 py-3 text-sm font-semibold text-white',
              'transition-colors hover:bg-blue-500 focus-visible:outline-none',
              'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
              'focus-visible:ring-offset-zinc-900',
            ].join(' ')}
          >
            <DownloadIcon />
            Download File
          </a>

          {/* Notice */}
          <p className="mt-4 text-center text-xs text-zinc-600">
            This link was shared publicly. You do not need an account to download.
          </p>
        </div>
      </div>

      {/* Footer */}
      <p className="mt-6 text-xs text-zinc-700">
        Powered by{' '}
        <span className="text-zinc-500">{APP_NAME}</span>
      </p>
    </div>
  );
}
