'use client';

import { cn } from '@/lib/utils';
import { formatDate, truncate } from '@/lib/utils';
import type { FolderItem } from '@/types';

interface FolderCardProps {
  folder: FolderItem;
  onOpen: (folder: FolderItem) => void;
  onRename: (folder: FolderItem) => void;
  onDelete: (folder: FolderItem) => void;
}

export function FolderCard({
  folder,
  onOpen,
  onRename,
  onDelete,
}: FolderCardProps): React.JSX.Element {
  return (
    <article
      className={cn(
        'group relative flex flex-col gap-3 rounded-2xl border p-4',
        'border-zinc-800/60 bg-zinc-900/80',
        'shadow-sm shadow-black/20',
        'transition-all duration-200 ease-out',
        'hover:border-amber-800/30 hover:bg-zinc-800/70 hover:shadow-md hover:shadow-black/30',
        'hover:-translate-y-0.5'
      )}
      aria-label={`Folder: ${folder.name}`}
    >
      {/* Folder icon + click to open */}
      <button
        type="button"
        onClick={() => onOpen(folder)}
        className={cn(
          'flex items-start gap-3 text-left',
          'rounded-xl transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50'
        )}
        aria-label={`Open folder ${folder.name}`}
      >
        {/* Folder icon */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-amber-900/30 bg-amber-950/40 transition-all duration-200 group-hover:scale-105">
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-6 w-6 text-amber-400"
            aria-hidden="true"
          >
            <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
          </svg>
        </div>

        <div className="min-w-0 flex-1">
          <p
            className="text-sm font-medium leading-snug text-zinc-100 transition-colors duration-150 group-hover:text-white"
            title={folder.name}
          >
            {truncate(folder.name, 36)}
          </p>
          <p className="mt-0.5 text-[11px] text-zinc-600">{formatDate(folder.createdAt)}</p>
        </div>
      </button>

      {/* Actions — appear on hover */}
      <div
        className={cn(
          'flex gap-1.5 transition-all duration-200',
          'opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:translate-y-1 sm:group-hover:translate-y-0'
        )}
      >
        {/* Rename */}
        <button
          type="button"
          onClick={() => onRename(folder)}
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-1.5',
            'border-zinc-700/60 bg-zinc-800/80 text-xs font-medium text-zinc-300',
            'transition-all duration-200 hover:border-zinc-600/80 hover:bg-zinc-700/80 hover:text-white',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50'
          )}
          aria-label={`Rename folder ${folder.name}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5" aria-hidden="true">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          Rename
        </button>

        {/* Delete */}
        <button
          type="button"
          onClick={() => onDelete(folder)}
          className={cn(
            'flex items-center justify-center rounded-xl border px-2.5 py-1.5',
            'border-zinc-700/60 bg-zinc-800/80 text-xs font-medium text-zinc-400',
            'transition-all duration-200 hover:border-red-800/60 hover:bg-red-950/40 hover:text-red-400',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50'
          )}
          aria-label={`Delete folder ${folder.name}`}
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
