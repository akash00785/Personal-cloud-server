'use client';

import { cn } from '@/lib/utils';
import type { SortField, SortOrder, ViewMode } from '@/types';

interface FileToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onSortFieldChange: (field: SortField) => void;
  onSortOrderToggle: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  fileCount: number;
}

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: 'name', label: 'Name' },
  { value: 'size', label: 'Size' },
  { value: 'date', label: 'Date' },
];

export function FileToolbar({
  search,
  onSearchChange,
  sortField,
  sortOrder,
  onSortFieldChange,
  onSortOrderToggle,
  viewMode,
  onViewModeChange,
  fileCount,
}: FileToolbarProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Left: search + count */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {/* Search */}
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4 text-zinc-500"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search files…"
            aria-label="Search files by name"
            className={cn(
              'w-full rounded-lg border border-zinc-700 bg-zinc-900 py-2 pl-9 pr-3',
              'text-sm text-zinc-100 placeholder:text-zinc-500',
              'focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500'
            )}
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="absolute inset-y-0 right-2 flex items-center px-1 text-zinc-500 hover:text-zinc-300"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Count */}
        <span className="shrink-0 text-xs text-zinc-500" aria-live="polite" aria-atomic="true">
          {fileCount} {fileCount === 1 ? 'file' : 'files'}
        </span>
      </div>

      {/* Right: sort + view toggle */}
      <div className="flex shrink-0 items-center gap-2">
        {/* Sort field */}
        <div className="flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-900 p-1">
          {SORT_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onSortFieldChange(value)}
              aria-pressed={sortField === value}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                sortField === value
                  ? 'bg-zinc-700 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Sort direction */}
        <button
          onClick={onSortOrderToggle}
          aria-label={sortOrder === 'asc' ? 'Sort ascending — click to sort descending' : 'Sort descending — click to sort ascending'}
          title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900',
            'text-zinc-400 transition-colors hover:border-zinc-600 hover:text-white'
          )}
        >
          {sortOrder === 'asc' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
              <path d="M3 9l4-4 4 4M7 5v14" />
              <path d="M13 15l4 4 4-4M17 19V5" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
              <path d="M3 15l4 4 4-4M7 19V5" />
              <path d="M13 9l4-4 4 4M17 5v14" />
            </svg>
          )}
        </button>

        {/* Divider */}
        <div className="h-5 w-px bg-zinc-700" aria-hidden="true" />

        {/* View mode toggle */}
        <div className="flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-900 p-1">
          <button
            onClick={() => onViewModeChange('grid')}
            aria-pressed={viewMode === 'grid'}
            aria-label="Grid view"
            title="Grid view"
            className={cn(
              'flex h-6 w-7 items-center justify-center rounded-md transition-colors',
              viewMode === 'grid'
                ? 'bg-zinc-700 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            )}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5" aria-hidden="true">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </button>

          <button
            onClick={() => onViewModeChange('list')}
            aria-pressed={viewMode === 'list'}
            aria-label="List view"
            title="List view"
            className={cn(
              'flex h-6 w-7 items-center justify-center rounded-md transition-colors',
              viewMode === 'list'
                ? 'bg-zinc-700 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            )}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5" aria-hidden="true">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
