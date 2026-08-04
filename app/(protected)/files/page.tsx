'use client';

import { useState, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { formatBytes } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { FileToolbar } from '@/components/files/FileToolbar';
import { UploadZone } from '@/components/files/UploadZone';
import { UploadQueue } from '@/components/files/UploadQueue';
import { FileCard } from '@/components/files/FileCard';
import { FileRow } from '@/components/files/FileRow';
import { DeleteDialog } from '@/components/files/DeleteDialog';
import { useFiles } from '@/hooks/useFiles';
import { useFileUpload } from '@/hooks/useFileUpload';
import type { FileListItem, SortField, SortOrder, ViewMode } from '@/types';

// Metadata cannot be exported from a 'use client' component, so it lives in a
// separate layout or is set via the generateMetadata pattern.  We set the
// <title> via document.title at runtime for the client component instead.

function sortFiles(
  files: FileListItem[],
  field: SortField,
  order: SortOrder
): FileListItem[] {
  return [...files].sort((a, b) => {
    let cmp = 0;
    switch (field) {
      case 'name':
        cmp = a.fileName.localeCompare(b.fileName, undefined, { sensitivity: 'base' });
        break;
      case 'size':
        cmp = a.fileSize - b.fileSize;
        break;
      case 'date':
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }
    return order === 'asc' ? cmp : -cmp;
  });
}

export default function FilesPage(): React.JSX.Element {
  // ── UI state ────────────────────────────────────────────────────────────────
  const [showUpload, setShowUpload] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [search, setSearch] = useState<string>('');

  // Delete dialog state
  const [pendingDelete, setPendingDelete] = useState<FileListItem | null>(null);

  // ── Data hooks ───────────────────────────────────────────────────────────────
  const { files, isLoading, error, fetchFiles, removeFile, downloadFile } = useFiles();

  const { queue, upload, clearQueue, hasActive } = useFileUpload(fetchFiles);

  // ── Derived data ─────────────────────────────────────────────────────────────
  const filteredAndSorted = useMemo<FileListItem[]>(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? files.filter((f) => f.fileName.toLowerCase().includes(q))
      : files;
    return sortFiles(filtered, sortField, sortOrder);
  }, [files, search, sortField, sortOrder]);

  const totalSize = useMemo<number>(
    () => files.reduce((acc, f) => acc + f.fileSize, 0),
    [files]
  );

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleFilesSelected = useCallback(
    (selectedFiles: File[]): void => {
      void upload(selectedFiles);
    },
    [upload]
  );

  const handleDeleteConfirm = useCallback(async (): Promise<void> => {
    if (!pendingDelete) return;
    await removeFile(pendingDelete.id);
    setPendingDelete(null);
  }, [pendingDelete, removeFile]);

  const handleSortFieldChange = useCallback((field: SortField): void => {
    setSortField(field);
  }, []);

  const handleSortOrderToggle = useCallback((): void => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Page header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">My Files</h1>
            {files.length > 0 && (
              <p className="mt-1 text-sm text-zinc-500">
                {files.length} {files.length === 1 ? 'file' : 'files'} &middot; {formatBytes(totalSize)}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Refresh */}
            <button
              onClick={() => void fetchFiles()}
              disabled={isLoading}
              aria-label="Refresh file list"
              title="Refresh"
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900',
                'text-zinc-400 transition-colors hover:border-zinc-600 hover:text-white',
                'disabled:pointer-events-none disabled:opacity-50'
              )}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={cn('h-4 w-4', isLoading && 'animate-spin')}
                aria-hidden="true"
              >
                <path d="M21 2v6h-6" />
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6" />
                <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
              </svg>
            </button>

            {/* Upload toggle */}
            <Button
              onClick={() => setShowUpload((v) => !v)}
              variant={showUpload ? 'secondary' : 'primary'}
              size="md"
              className="gap-2"
            >
              {showUpload ? (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  Close Upload
                </>
              ) : (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Upload Files
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Upload zone */}
        {showUpload && (
          <UploadZone onFiles={handleFilesSelected} disabled={hasActive} />
        )}

        {/* Upload queue */}
        <UploadQueue queue={queue} onClear={clearQueue} />

        {/* Toolbar — only shown when there are files */}
        {files.length > 0 && (
          <FileToolbar
            search={search}
            onSearchChange={setSearch}
            sortField={sortField}
            sortOrder={sortOrder}
            onSortFieldChange={handleSortFieldChange}
            onSortOrderToggle={handleSortOrderToggle}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            fileCount={filteredAndSorted.length}
          />
        )}

        {/* Content area */}
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={() => void fetchFiles()} />
        ) : files.length === 0 ? (
          <EmptyState onUpload={() => setShowUpload(true)} />
        ) : filteredAndSorted.length === 0 ? (
          <NoResultsState query={search} onClear={() => setSearch('')} />
        ) : viewMode === 'grid' ? (
          <GridView
            files={filteredAndSorted}
            onDownload={downloadFile}
            onDelete={setPendingDelete}
          />
        ) : (
          <ListView
            files={filteredAndSorted}
            onDownload={downloadFile}
            onDelete={setPendingDelete}
          />
        )}
      </div>

      {/* Delete confirmation dialog — key resets component state on each open */}
      <DeleteDialog
        key={pendingDelete?.id ?? 'delete-dialog'}
        isOpen={pendingDelete !== null}
        fileName={pendingDelete?.fileName ?? ''}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function LoadingState(): React.JSX.Element {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center gap-4">
      <Spinner size="lg" className="text-zinc-600" />
      <p className="text-sm text-zinc-500">Loading your files…</p>
    </div>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

function ErrorState({ message, onRetry }: ErrorStateProps): React.JSX.Element {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-xl border border-red-900/40 bg-red-900/10 px-6 py-12">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-900/30">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="h-6 w-6 text-red-400"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <div className="text-center">
        <p className="font-medium text-white">Failed to load files</p>
        <p className="mt-1 text-sm text-zinc-400">{message}</p>
      </div>
      <Button variant="secondary" size="sm" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}

interface EmptyStateProps {
  onUpload: () => void;
}

function EmptyState({ onUpload }: EmptyStateProps): React.JSX.Element {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center gap-5 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          className="h-8 w-8 text-zinc-500"
          aria-hidden="true"
        >
          <path d="M3 15v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4" />
          <path d="M8 7l4-4 4 4" />
          <path d="M12 3v12" />
          <rect x="3" y="15" width="18" height="6" rx="2" />
        </svg>
      </div>
      <div>
        <p className="text-lg font-semibold text-white">No files yet</p>
        <p className="mt-1 text-sm text-zinc-500">
          Upload your first file to get started. Your files are stored privately and securely.
        </p>
      </div>
      <Button variant="primary" onClick={onUpload} className="gap-2">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        Upload files
      </Button>
    </div>
  );
}

interface NoResultsStateProps {
  query: string;
  onClear: () => void;
}

function NoResultsState({ query, onClear }: NoResultsStateProps): React.JSX.Element {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/30 px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="h-6 w-6 text-zinc-500"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
      <div>
        <p className="font-medium text-white">No results for &ldquo;{query}&rdquo;</p>
        <p className="mt-1 text-sm text-zinc-500">Try a different name or clear your search.</p>
      </div>
      <Button variant="secondary" size="sm" onClick={onClear}>
        Clear search
      </Button>
    </div>
  );
}

interface FileViewProps {
  files: FileListItem[];
  onDownload: (id: string, fileName: string) => Promise<void>;
  onDelete: (file: FileListItem) => void;
}

function GridView({ files, onDownload, onDelete }: FileViewProps): React.JSX.Element {
  return (
    <div
      className="grid gap-4"
      style={{
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 200px), 1fr))',
      }}
      role="list"
      aria-label="Files in grid view"
    >
      {files.map((file) => (
        <div key={file.id} role="listitem">
          <FileCard
            file={file}
            onDownload={onDownload}
            onDelete={onDelete}
          />
        </div>
      ))}
    </div>
  );
}

function ListView({ files, onDownload, onDelete }: FileViewProps): React.JSX.Element {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950">
      {/* Table header */}
      <div
        className="hidden grid-cols-[1fr_80px_80px_112px_72px] items-center gap-3 border-b border-zinc-800 px-4 py-2 text-xs font-medium uppercase tracking-wide text-zinc-500 sm:grid md:grid-cols-[1fr_80px_80px_112px_72px]"
        aria-hidden="true"
      >
        <span>Name</span>
        <span className="text-right">Type</span>
        <span className="text-right">Size</span>
        <span className="hidden text-right md:block">Date</span>
        <span className="text-right">Actions</span>
      </div>

      <ul aria-label="Files in list view">
        {files.map((file, i) => (
          <li
            key={file.id}
            className={cn(i < files.length - 1 && 'border-b border-zinc-900')}
          >
            <FileRow
              file={file}
              onDownload={onDownload}
              onDelete={onDelete}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
