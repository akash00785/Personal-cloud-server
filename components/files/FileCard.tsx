'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { formatBytes, formatDate, truncate } from '@/lib/utils';
import { FileIcon, getMimeLabel } from '@/components/files/FileIcon';
import { isPreviewable } from '@/components/files/PreviewDialog';
import type { FileListItem } from '@/types';

interface FileCardProps {
  file: FileListItem;
  onDownload: (id: string, fileName: string) => Promise<void>;
  onDelete: (file: FileListItem) => void;
  onPreview: (file: FileListItem) => void;
  onShare: (file: FileListItem) => void;
}

export function FileCard({
  file,
  onDownload,
  onDelete,
  onPreview,
  onShare,
}: FileCardProps): React.JSX.Element {
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const canPreview = isPreviewable(file.mimeType);

  const handleDownload = async (): Promise<void> => {
    setIsDownloading(true);
    setDownloadError(null);
    try {
      await onDownload(file.id, file.fileName);
    } catch (err: unknown) {
      setDownloadError(err instanceof Error ? err.message : 'Download failed.');
      setTimeout(() => setDownloadError(null), 4000);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <article
      className={cn(
        'group relative flex flex-col gap-3 rounded-2xl border p-4',
        'border-zinc-800/60 bg-zinc-900/80',
        'shadow-sm shadow-black/20',
        'transition-all duration-200 ease-out',
        'hover:border-emerald-800/30 hover:bg-zinc-800/70 hover:shadow-md hover:shadow-black/30',
        'hover:-translate-y-0.5'
      )}
      aria-label={`File: ${file.fileName}`}
    >
      {/* Icon + type badge */}
      <div className="flex items-start justify-between">
        {/* Clicking the icon opens preview if available */}
        <button
          onClick={() => canPreview && onPreview(file)}
          disabled={!canPreview}
          className={cn(
            'rounded-xl transition-all duration-200',
            canPreview
              ? 'cursor-pointer hover:opacity-80 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50'
              : 'cursor-default'
          )}
          aria-label={canPreview ? `Preview ${file.fileName}` : undefined}
          tabIndex={canPreview ? 0 : -1}
        >
          <FileIcon mimeType={file.mimeType} size="lg" />
        </button>
        <span className="rounded-lg bg-zinc-800/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 border border-zinc-700/40">
          {getMimeLabel(file.mimeType)}
        </span>
      </div>

      {/* File name — clicking opens preview */}
      <div className="min-w-0">
        <button
          onClick={() => canPreview && onPreview(file)}
          disabled={!canPreview}
          className={cn(
            'w-full text-left text-sm font-medium leading-snug text-zinc-100',
            canPreview
              ? 'cursor-pointer hover:text-emerald-400 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50'
              : 'cursor-default'
          )}
          title={file.fileName}
          tabIndex={canPreview ? 0 : -1}
        >
          {truncate(file.fileName, 36)}
        </button>
        <p className="mt-0.5 text-xs text-zinc-500">{formatBytes(file.fileSize)}</p>
      </div>

      {/* Date */}
      <p className="text-[11px] text-zinc-600">{formatDate(file.createdAt)}</p>

      {/* Error */}
      {downloadError && (
        <p className="rounded-lg border border-red-800/40 bg-red-950/40 px-2 py-1.5 text-xs text-red-400">
          {downloadError}
        </p>
      )}

      {/* Actions — appear on hover (always visible on touch) */}
      <div
        className={cn(
          'flex gap-1.5 transition-all duration-200',
          'opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:translate-y-1 sm:group-hover:translate-y-0'
        )}
      >
        {/* Preview button — only shown for previewable types */}
        {canPreview && (
          <button
            onClick={() => onPreview(file)}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-xl border',
              'border-zinc-700/60 bg-zinc-800/80 text-zinc-400',
              'transition-all duration-200 hover:border-blue-700/60 hover:bg-blue-900/20 hover:text-blue-400',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50'
            )}
            aria-label={`Preview ${file.fileName}`}
            title="Preview"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5" aria-hidden="true">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        )}

        {/* Share */}
        <button
          onClick={() => onShare(file)}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-xl border',
            'border-zinc-700/60 bg-zinc-800/80 text-zinc-400',
            'transition-all duration-200 hover:border-emerald-700/60 hover:bg-emerald-900/20 hover:text-emerald-400',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50'
          )}
          aria-label={`Share ${file.fileName}`}
          title="Share"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5" aria-hidden="true">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </button>

        {/* Download */}
        <button
          onClick={() => void handleDownload()}
          disabled={isDownloading}
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-1.5',
            'border-zinc-700/60 bg-zinc-800/80 text-xs font-medium text-zinc-300',
            'transition-all duration-200 hover:border-zinc-600/80 hover:bg-zinc-700/80 hover:text-white',
            'disabled:pointer-events-none disabled:opacity-40',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50'
          )}
          aria-label={`Download ${file.fileName}`}
        >
          {isDownloading ? (
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-600 border-t-emerald-400" aria-hidden="true" />
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          )}
          {isDownloading ? 'Downloading…' : 'Download'}
        </button>

        {/* Delete */}
        <button
          onClick={() => onDelete(file)}
          className={cn(
            'flex items-center justify-center rounded-xl border px-2.5 py-1.5',
            'border-zinc-700/60 bg-zinc-800/80 text-xs font-medium text-zinc-400',
            'transition-all duration-200 hover:border-red-800/60 hover:bg-red-950/40 hover:text-red-400',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50'
          )}
          aria-label={`Delete ${file.fileName}`}
          title="Delete"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5" aria-hidden="true">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </button>
      </div>
    </article>
  );
}
