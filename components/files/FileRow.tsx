'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { formatBytes, formatDate, truncate } from '@/lib/utils';
import { FileIcon, getMimeLabel } from '@/components/files/FileIcon';
import type { FileListItem } from '@/types';

interface FileRowProps {
  file: FileListItem;
  onDownload: (id: string, fileName: string) => Promise<void>;
  onDelete: (file: FileListItem) => void;
}

export function FileRow({ file, onDownload, onDelete }: FileRowProps): React.JSX.Element {
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

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
      {/* Icon */}
      <FileIcon mimeType={file.mimeType} size="sm" className="shrink-0" />

      {/* Name + error */}
      <div className="min-w-0 flex-1">
        <p
          className="truncate text-sm font-medium text-zinc-100"
          title={file.fileName}
        >
          {file.fileName}
        </p>
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
        <button
          onClick={() => void handleDownload()}
          disabled={isDownloading}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800',
            'text-zinc-400 transition-colors hover:border-zinc-600 hover:text-white',
            'disabled:pointer-events-none disabled:opacity-50'
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

        <button
          onClick={() => onDelete(file)}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800',
            'text-zinc-400 transition-colors hover:border-red-800 hover:bg-red-900/20 hover:text-red-400'
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
