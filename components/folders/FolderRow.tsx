'use client';

import { cn } from '@/lib/utils';
import { formatDate, truncate } from '@/lib/utils';
import type { FolderItem } from '@/types';

interface FolderRowProps {
  folder: FolderItem;
  onOpen: (folder: FolderItem) => void;
  onRename: (folder: FolderItem) => void;
  onDelete: (folder: FolderItem) => void;
}

export function FolderRow({
  folder,
  onOpen,
  onRename,
  onDelete,
}: FolderRowProps): React.JSX.Element {
  return (
    <li
      className={cn(
        'group flex items-center gap-3 rounded-xl border border-transparent px-4 py-3',
        'transition-colors hover:border-zinc-800 hover:bg-zinc-900'
      )}
      aria-label={`Folder: ${folder.name}`}
    >
      {/* Icon */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-900/30">
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-4 w-4 text-amber-400"
          aria-hidden="true"
        >
          <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
        </svg>
      </div>

      {/* Name — click to open */}
      <button
        type="button"
        onClick={() => onOpen(folder)}
        className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 rounded"
        aria-label={`Open folder ${folder.name}`}
      >
        <p
          className="truncate text-sm font-medium text-zinc-100 hover:text-white"
          title={folder.name}
        >
          {folder.name}
        </p>
      </button>

      {/* Type badge */}
      <span className="hidden w-20 shrink-0 text-right text-xs text-zinc-500 sm:block">
        Folder
      </span>

      {/* Date — hidden on sm */}
      <span className="hidden w-28 shrink-0 text-right text-xs text-zinc-500 md:block">
        {formatDate(folder.createdAt)}
      </span>

      {/* Actions */}
      <div
        className={cn(
          'flex shrink-0 items-center gap-1 transition-opacity duration-150',
          'opacity-100 sm:opacity-0 sm:group-hover:opacity-100'
        )}
      >
        {/* Rename */}
        <button
          type="button"
          onClick={() => onRename(folder)}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800',
            'text-zinc-400 transition-colors hover:border-zinc-600 hover:text-white',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500'
          )}
          aria-label={`Rename folder ${folder.name}`}
          title={`Rename ${truncate(folder.name, 24)}`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-3.5 w-3.5"
            aria-hidden="true"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        </button>

        {/* Delete */}
        <button
          type="button"
          onClick={() => onDelete(folder)}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800',
            'text-zinc-400 transition-colors hover:border-red-800 hover:bg-red-900/20 hover:text-red-400',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500'
          )}
          aria-label={`Delete folder ${folder.name}`}
          title={`Delete ${truncate(folder.name, 24)}`}
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
