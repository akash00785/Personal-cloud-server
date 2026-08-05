'use client';

import { useState, useMemo, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
import { PreviewDialog } from '@/components/files/PreviewDialog';
import { ShareDialog } from '@/components/files/ShareDialog';
import { Breadcrumb } from '@/components/folders/Breadcrumb';
import { FolderCard } from '@/components/folders/FolderCard';
import { FolderRow } from '@/components/folders/FolderRow';
import { CreateFolderDialog } from '@/components/folders/CreateFolderDialog';
import { RenameFolderDialog } from '@/components/folders/RenameFolderDialog';
import { DeleteFolderDialog } from '@/components/folders/DeleteFolderDialog';
import { useFiles } from '@/hooks/useFiles';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useFolders } from '@/hooks/useFolders';
import type { FileListItem, FolderItem, SortField, SortOrder, ViewMode } from '@/types';

// ─── Sort helper ──────────────────────────────────────────────────────────────

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

// ─── Inner page (needs useSearchParams) ──────────────────────────────────────

function FilesPageContent(): React.JSX.Element {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Current folder from URL query param; null = root
  const folderIdParam = searchParams.get('folderId');
  const currentFolderId: string | null = folderIdParam ?? null;

  // ── UI state ────────────────────────────────────────────────────────────────
  const [showUpload, setShowUpload] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [search, setSearch] = useState<string>('');

  // File delete dialog
  const [pendingDeleteFile, setPendingDeleteFile] = useState<FileListItem | null>(null);

  // File preview dialog
  const [pendingPreviewFile, setPendingPreviewFile] = useState<FileListItem | null>(null);

  // File share dialog
  const [pendingShareFile, setPendingShareFile] = useState<FileListItem | null>(null);

  // Folder dialogs
  const [showCreateFolder, setShowCreateFolder] = useState<boolean>(false);
  const [pendingRenameFolder, setPendingRenameFolder] = useState<FolderItem | null>(null);
  const [pendingDeleteFolder, setPendingDeleteFolder] = useState<FolderItem | null>(null);

  // ── Data hooks ───────────────────────────────────────────────────────────────
  // Pass currentFolderId (null = root files only)
  const { files, isLoading: filesLoading, error: filesError, fetchFiles, removeFile, downloadFile } =
    useFiles(currentFolderId);

  const {
    folders,
    breadcrumbs,
    isLoading: foldersLoading,
    error: foldersError,
    fetchFolders,
    addFolder,
    editFolder,
    removeFolder,
  } = useFolders(currentFolderId);

  const { queue, upload, clearQueue, hasActive } = useFileUpload(fetchFiles, currentFolderId);

  // ── Derived data ─────────────────────────────────────────────────────────────
  const filteredAndSortedFiles = useMemo<FileListItem[]>(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? files.filter((f) => f.fileName.toLowerCase().includes(q))
      : files;
    return sortFiles(filtered, sortField, sortOrder);
  }, [files, search, sortField, sortOrder]);

  const filteredFolders = useMemo<FolderItem[]>(() => {
    const q = search.trim().toLowerCase();
    return q ? folders.filter((f) => f.name.toLowerCase().includes(q)) : folders;
  }, [folders, search]);

  const totalSize = useMemo<number>(
    () => files.reduce((acc, f) => acc + f.fileSize, 0),
    [files]
  );

  const isLoading = filesLoading || foldersLoading;
  const error = filesError ?? foldersError;

  // ── Navigation ────────────────────────────────────────────────────────────────
  const navigateToFolder = useCallback(
    (folderId: string | null): void => {
      setSearch('');
      if (folderId === null) {
        router.push('/files');
      } else {
        router.push(`/files?folderId=${encodeURIComponent(folderId)}`);
      }
    },
    [router]
  );

  // ── File handlers ─────────────────────────────────────────────────────────────
  const handleFilesSelected = useCallback(
    (selectedFiles: File[]): void => {
      void upload(selectedFiles);
    },
    [upload]
  );

  const handleFileDeleteConfirm = useCallback(async (): Promise<void> => {
    if (!pendingDeleteFile) return;
    await removeFile(pendingDeleteFile.id);
    setPendingDeleteFile(null);
  }, [pendingDeleteFile, removeFile]);

  const handlePreviewOpen = useCallback((file: FileListItem): void => {
    setPendingPreviewFile(file);
  }, []);

  const handlePreviewClose = useCallback((): void => {
    setPendingPreviewFile(null);
  }, []);

  const handleShareOpen = useCallback((file: FileListItem): void => {
    // Close preview if open, then open share dialog
    setPendingPreviewFile(null);
    setPendingShareFile(file);
  }, []);

  const handleShareClose = useCallback((): void => {
    setPendingShareFile(null);
  }, []);

  // ── Folder handlers ───────────────────────────────────────────────────────────
  const handleCreateFolder = useCallback(
    async (name: string): Promise<void> => {
      await addFolder(name);
      setShowCreateFolder(false);
    },
    [addFolder]
  );

  const handleRenameFolder = useCallback(
    async (id: string, name: string): Promise<void> => {
      await editFolder(id, name);
      setPendingRenameFolder(null);
    },
    [editFolder]
  );

  const handleDeleteFolderConfirm = useCallback(async (): Promise<void> => {
    if (!pendingDeleteFolder) return;
    await removeFolder(pendingDeleteFolder.id);
    setPendingDeleteFolder(null);
    // Refresh files since deleted folder's files move to root
    fetchFiles();
  }, [pendingDeleteFolder, removeFolder, fetchFiles]);

  const handleRefresh = useCallback((): void => {
    fetchFiles();
    fetchFolders();
  }, [fetchFiles, fetchFolders]);

  // ── Sort handlers ─────────────────────────────────────────────────────────────
  const handleSortFieldChange = useCallback((field: SortField): void => {
    setSortField(field);
  }, []);

  const handleSortOrderToggle = useCallback((): void => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  }, []);

  // ── Totals ────────────────────────────────────────────────────────────────────
  const totalItemCount = filteredFolders.length + filteredAndSortedFiles.length;

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Page header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Files</h1>
            <p className="mt-1 text-sm text-zinc-400">
              {files.length} file{files.length !== 1 ? 's' : ''}
              {files.length > 0 && ` · ${formatBytes(totalSize)}`}
              {folders.length > 0 && ` · ${folders.length} folder${folders.length !== 1 ? 's' : ''}`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Refresh */}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isLoading}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800',
                'text-zinc-400 transition-colors hover:border-zinc-600 hover:text-white',
                'disabled:pointer-events-none disabled:opacity-50'
              )}
              aria-label="Refresh"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={cn('h-4 w-4', isLoading && 'animate-spin')}
                aria-hidden="true"
              >
                <path d="M23 4v6h-6" />
                <path d="M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
            </button>

            {/* New Folder */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowCreateFolder(true)}
              aria-label="Create new folder"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                <line x1="12" y1="11" x2="12" y2="17" />
                <line x1="9" y1="14" x2="15" y2="14" />
              </svg>
              New Folder
            </Button>

            {/* Upload toggle */}
            <Button
              variant={showUpload ? 'ghost' : 'primary'}
              size="sm"
              onClick={() => setShowUpload((v) => !v)}
              aria-expanded={showUpload}
            >
              {showUpload ? 'Hide Upload' : 'Upload Files'}
            </Button>
          </div>
        </div>

        {/* Breadcrumb */}
        <Breadcrumb crumbs={breadcrumbs} onNavigate={navigateToFolder} />

        {/* Upload zone */}
        {showUpload && (
          <div className="space-y-3">
            <UploadZone onFiles={handleFilesSelected} disabled={hasActive} />
            {queue.length > 0 && <UploadQueue queue={queue} onClear={clearQueue} />}
          </div>
        )}

        {/* Toolbar */}
        <FileToolbar
          search={search}
          onSearchChange={setSearch}
          sortField={sortField}
          sortOrder={sortOrder}
          onSortFieldChange={handleSortFieldChange}
          onSortOrderToggle={handleSortOrderToggle}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          fileCount={totalItemCount}
        />

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div
            role="alert"
            className="rounded-xl border border-red-800 bg-red-900/20 px-6 py-8 text-center"
          >
            <p className="font-medium text-red-400">{error}</p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-4"
              onClick={handleRefresh}
            >
              Try again
            </Button>
          </div>
        ) : filteredFolders.length === 0 && filteredAndSortedFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            {search ? (
              <>
                <p className="text-lg font-medium text-zinc-300">No results for &ldquo;{search}&rdquo;</p>
                <p className="mt-1 text-sm text-zinc-500">Try a different search term.</p>
              </>
            ) : (
              <>
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="h-8 w-8 text-zinc-500"
                    aria-hidden="true"
                  >
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <p className="text-lg font-medium text-zinc-300">This folder is empty</p>
                <p className="mt-1 text-sm text-zinc-500">
                  Upload files or create a new folder to get started.
                </p>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowCreateFolder(true)}
                  >
                    New Folder
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowUpload(true)}
                  >
                    Upload Files
                  </Button>
                </div>
              </>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 200px), 1fr))',
            }}
            role="list"
            aria-label="Folders and files in grid view"
          >
            {/* Folders first */}
            {filteredFolders.map((folder) => (
              <div key={`folder-${folder.id}`} role="listitem">
                <FolderCard
                  folder={folder}
                  onOpen={(f) => navigateToFolder(f.id)}
                  onRename={(f) => setPendingRenameFolder(f)}
                  onDelete={(f) => setPendingDeleteFolder(f)}
                />
              </div>
            ))}
            {/* Then files */}
            {filteredAndSortedFiles.map((file) => (
              <div key={`file-${file.id}`} role="listitem">
                <FileCard
                  file={file}
                  onDownload={downloadFile}
                  onDelete={(f) => setPendingDeleteFile(f)}
                  onPreview={handlePreviewOpen}
                  onShare={handleShareOpen}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-800/60 bg-zinc-950/60 overflow-hidden">
            {/* Table header */}
            <div
              className="hidden grid-cols-[1fr_80px_80px_112px_72px] items-center gap-3 border-b border-zinc-800/60 bg-zinc-900/40 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 sm:grid"
              aria-hidden="true"
            >
              <span>Name</span>
              <span className="text-right">Type</span>
              <span className="text-right">Size</span>
              <span className="hidden text-right md:block">Date</span>
              <span className="text-right">Actions</span>
            </div>

            <ul aria-label="Folders and files in list view">
              {/* Folders first */}
              {filteredFolders.map((folder, i) => (
                <li
                  key={`folder-${folder.id}`}
                  className={cn(
                    (i < filteredFolders.length - 1 || filteredAndSortedFiles.length > 0) &&
                      'border-b border-zinc-900'
                  )}
                >
                  <FolderRow
                    folder={folder}
                    onOpen={(f) => navigateToFolder(f.id)}
                    onRename={(f) => setPendingRenameFolder(f)}
                    onDelete={(f) => setPendingDeleteFolder(f)}
                  />
                </li>
              ))}
              {/* Then files */}
              {filteredAndSortedFiles.map((file, i) => (
                <li
                  key={`file-${file.id}`}
                  className={cn(i < filteredAndSortedFiles.length - 1 && 'border-b border-zinc-900')}
                >
                  <FileRow
                    file={file}
                    onDownload={downloadFile}
                    onDelete={(f) => setPendingDeleteFile(f)}
                    onPreview={handlePreviewOpen}
                    onShare={handleShareOpen}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* ── Dialogs ────────────────────────────────────────────────────────────── */}

      {/* File preview */}
      <PreviewDialog
        key={pendingPreviewFile?.id ?? 'no-preview'}
        isOpen={pendingPreviewFile !== null}
        file={pendingPreviewFile}
        onClose={handlePreviewClose}
        onDownload={downloadFile}
        onShare={handleShareOpen}
      />

      {/* File share */}
      <ShareDialog
        key={pendingShareFile?.id ?? 'no-share'}
        isOpen={pendingShareFile !== null}
        file={pendingShareFile}
        onClose={handleShareClose}
      />

      {/* File delete confirmation */}
      <DeleteDialog
        key={pendingDeleteFile?.id ?? 'no-file'}
        isOpen={pendingDeleteFile !== null}
        fileName={pendingDeleteFile?.fileName ?? ''}
        onConfirm={handleFileDeleteConfirm}
        onCancel={() => setPendingDeleteFile(null)}
      />

      {/* Create folder */}
      <CreateFolderDialog
        isOpen={showCreateFolder}
        onConfirm={handleCreateFolder}
        onCancel={() => setShowCreateFolder(false)}
      />

      {/* Rename folder */}
      <RenameFolderDialog
        key={pendingRenameFolder?.id ?? 'no-rename'}
        isOpen={pendingRenameFolder !== null}
        folder={pendingRenameFolder}
        onConfirm={handleRenameFolder}
        onCancel={() => setPendingRenameFolder(null)}
      />

      {/* Delete folder */}
      <DeleteFolderDialog
        key={pendingDeleteFolder?.id ?? 'no-folder-delete'}
        isOpen={pendingDeleteFolder !== null}
        folder={pendingDeleteFolder}
        onConfirm={handleDeleteFolderConfirm}
        onCancel={() => setPendingDeleteFolder(null)}
      />
    </>
  );
}

// ─── Outer export (Suspense boundary for useSearchParams) ─────────────────────

export default function FilesPage(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <Spinner size="lg" />
        </div>
      }
    >
      <FilesPageContent />
    </Suspense>
  );
}
