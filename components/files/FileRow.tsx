'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { formatBytes, formatDate, truncate } from '@/lib/utils';
import { FileIcon, getMimeLabel } from '@/components/files/FileIcon';
import { isPreviewable } from '@/components/files/PreviewDialog';
import type { FileListItem } from '@/types';

interface FileRowProps {
  file: FileListItem;
  onDownload: (id: string, fileName: string) => Promise<void>;
  onDelete: (file: FileListItem) => void;
  onPreview: (file: FileListItem) => void;
  onShare: (file: FileListItem) => void;
}

export function FileRow({
  file,
  onDownload,
  onDelete,
  onPreview,
  onShare,
}: FileRowProps): React.JSX.Element {
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
    <li
      className={cn(
        'group flex items-center gap-3 rounded-xl border border-transparent px-4 py-3',
        'transition-colors hover:border-zinc-800 hover:bg-zinc-900'
      )}
      aria-label={`File: ${file.fileName}`}
    >
      {/* Icon — clicking opens preview */}
      <button
        onClick={() => canPreview && onPreview(file)}
        disabled={!canPreview}
        className={cn(
          'shrink-0 rounded-lg transition-opacity',
          canPreview
            ? 'cursor-pointer hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500'
            : 'cursor-default'
        )}
        aria-label={canPreview ? `Preview ${file.fileName}` : undefined}
        tabIndex={canPreview ? 0 : -1}
      >
        <FileIcon mimeType={file.mimeType} size="sm" />
      </button>

      {/* Name + error */}
      <div className="min-w-0 flex-1">
        <button
          onClick={() => canPreview && onPreview(file)}
          disabled={!canPreview}
          className={cn(
            'w-full truncate text-left text-sm font-medium text-zinc-100',
            canPreview
              ? 'cursor-pointer hover:text-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500'
              : 'cursor-default'
          )}
          title={file.fileName}
          tabIndex={canPreview ? 0 : -1}
        >
          {file.fileName}
        </button>
        {downloadError && (
          <p className="text-xs text-red-400">{downloadError}</p>
        )}
      </div>

      {/* Type — hidden on xs */}
      <span className="hidden w-20 shrink-0 text-right text-xs text-zinc-500 sm:block">
        {getMimeLabel(file.mimeType)}
      </span>

      {/* Size — hidden on xs */}
      <span className="hidden w-20 shrink-0 text-right text-xs text-zinc-400 sm:block">
        {formatBytes(file.fileSize)}
      </span>

      {/* Date — hidden on sm */}
      <span className="hidden w-28 shrink-0 text-right text-xs text-zinc-500 md:block">
        {formatDate(file.createdAt)}
      </span>

      {/* Mobile: size only */}
      <span className="shrink-0 text-xs text-zinc-500 sm:hidden">
        {formatBytes(file.fileSize)}
      </span>

      {/* Actions */}
      <div
        className={cn(
          'flex shrink-0 items-center gap-1 transition-opacity duration-150',
          'opacity-100 sm:opacity-0 sm:group-hover:opacity-100'
        )}
      >
        {/* Preview */}
        {canPreview && (
          <button
            onClick={() => onPreview(file)}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800',
              'text-zinc-400 transition-colors hover:border-blue-700 hover:bg-blue-900/20 hover:text-blue-400',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500'
            )}
            aria-label={`Preview ${file.fileName}`}
            title={`Preview ${truncate(file.fileName, 24)}`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-3.5 w-3.5"
              aria-hidden="true"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        )}

        {/* Share */}
        <button
          onClick={() => onShare(file)}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800',
            'text-zinc-400 transition-colors hover:border-blue-700 hover:bg-blue-900/20 hover:text-blue-400',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500'
          )}
          aria-label={`Share ${file.fileName}`}
          title={`Share ${truncate(file.fileName, 24)}`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-3.5 w-3.5"
            aria-hidden="true"
          >
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
            'flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800',
            'text-zinc-400 transition-colors hover:border-zinc-600 hover:text-white',
            'disabled:pointer-events-none disabled:opacity-50',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500'
          )}
          aria-label={`Download ${file.fileName}`}
          title={`Download ${truncate(file.fileName, 24)}`}
        >
          {isDownloading ? (
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-600 border-t-zinc-300" aria-hidden="true" />
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-3.5 w-3.5"
              aria-hidden="true"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          )}
        </button>

        {/* Delete */}
        <button
          onClick={() => onDelete(file)}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800',
            'text-zinc-400 transition-colors hover:border-red-800 hover:bg-red-900/20 hover:text-red-400',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500'
          )}
          aria-label={`Delete ${file.fileName}`}
          title={`Delete ${truncate(file.fileName, 24)}`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-3.5 w-3.5"
            aria-hidden="true"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </button>
      </div>
    </li>
  );
}
