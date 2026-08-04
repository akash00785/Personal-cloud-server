'use client';

import { cn } from '@/lib/utils';
import { formatBytes } from '@/lib/utils';
import type { UploadingFile } from '@/types';

interface UploadQueueProps {
  queue: UploadingFile[];
  onClear: () => void;
}

const statusLabel: Record<UploadingFile['status'], string> = {
  pending: 'Waiting…',
  uploading: 'Uploading…',
  done: 'Done',
  error: 'Failed',
};

export function UploadQueue({ queue, onClear }: UploadQueueProps): React.JSX.Element | null {
  if (queue.length === 0) return null;

  const doneCount = queue.filter((i) => i.status === 'done').length;
  const errorCount = queue.filter((i) => i.status === 'error').length;
  const activeCount = queue.filter(
    (i) => i.status === 'uploading' || i.status === 'pending'
  ).length;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {activeCount > 0 ? (
            <span
              role="status"
              aria-label="Uploading"
              className="h-2 w-2 animate-pulse rounded-full bg-blue-400"
            />
          ) : errorCount > 0 ? (
            <span className="h-2 w-2 rounded-full bg-red-400" />
          ) : (
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
          )}
          <span className="text-sm font-medium text-zinc-200">
            {activeCount > 0
              ? `Uploading ${activeCount} file${activeCount !== 1 ? 's' : ''}…`
              : errorCount > 0
                ? `${doneCount} uploaded, ${errorCount} failed`
                : `${doneCount} file${doneCount !== 1 ? 's' : ''} uploaded`}
          </span>
        </div>

        {activeCount === 0 && (
          <button
            onClick={onClear}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            aria-label="Clear upload queue"
          >
            Clear
          </button>
        )}
      </div>

      {/* Items */}
      <ul className="space-y-2" aria-label="Upload queue">
        {queue.map((item) => (
          <li key={item.id} className="flex items-center gap-3">
            {/* Status icon */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
              {item.status === 'uploading' || item.status === 'pending' ? (
                <span
                  className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-600 border-t-blue-400"
                  aria-hidden="true"
                />
              ) : item.status === 'done' ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="h-4 w-4 text-emerald-400"
                  aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="h-4 w-4 text-red-400"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              )}
            </div>

            {/* File info + progress */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span
                  className="truncate text-sm text-zinc-200"
                  title={item.name}
                >
                  {item.name}
                </span>
                <span
                  className={cn(
                    'shrink-0 text-xs',
                    item.status === 'done'
                      ? 'text-emerald-400'
                      : item.status === 'error'
                        ? 'text-red-400'
                        : 'text-zinc-500'
                  )}
                >
                  {item.status === 'uploading'
                    ? `${item.progress}%`
                    : item.status === 'error'
                      ? 'Error'
                      : item.status === 'done'
                        ? formatBytes(item.size)
                        : statusLabel[item.status]}
                </span>
              </div>

              {/* Progress bar */}
              {(item.status === 'uploading' || item.status === 'pending') && (
                <div
                  className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-zinc-700"
                  role="progressbar"
                  aria-valuenow={item.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Upload progress for ${item.name}`}
                >
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-200"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              )}

              {/* Error message */}
              {item.status === 'error' && item.error && (
                <p className="mt-0.5 truncate text-xs text-red-400" title={item.error}>
                  {item.error}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
