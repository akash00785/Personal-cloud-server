'use client';

import { useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { ACCEPTED_FILE_TYPES, MAX_UPLOAD_SIZE_MB } from '@/lib/constants';

interface UploadZoneProps {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}

export function UploadZone({ onFiles, disabled = false }: UploadZoneProps): React.JSX.Element {
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const dragCounter = useRef<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (fileList: FileList | null): void => {
      if (!fileList || fileList.length === 0) return;
      onFiles(Array.from(fileList));
    },
    [onFiles]
  );

  const onDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragOver(false);
    }
  }, []);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>): void => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current = 0;
      setIsDragOver(false);
      if (disabled) return;
      handleFiles(e.dataTransfer.files);
    },
    [disabled, handleFiles]
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      handleFiles(e.target.files);
      // Reset input so the same file can be re-selected
      e.target.value = '';
    },
    [handleFiles]
  );

  const openPicker = useCallback((): void => {
    if (!disabled) inputRef.current?.click();
  }, [disabled]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>): void => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openPicker();
      }
    },
    [openPicker]
  );

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Upload files — click or drag and drop"
      aria-disabled={disabled}
      onClick={openPicker}
      onKeyDown={onKeyDown}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={cn(
        'relative flex min-h-[140px] w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-all',
        isDragOver
          ? 'border-blue-500 bg-blue-500/10 scale-[1.01]'
          : 'border-zinc-700 bg-zinc-900/50 hover:border-zinc-500 hover:bg-zinc-900',
        disabled && 'pointer-events-none opacity-50'
      )}
    >
      {/* Upload icon */}
      <div
        className={cn(
          'flex h-12 w-12 items-center justify-center rounded-full transition-colors',
          isDragOver ? 'bg-blue-500/20' : 'bg-zinc-800'
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={cn('h-6 w-6 transition-colors', isDragOver ? 'text-blue-400' : 'text-zinc-400')}
          aria-hidden="true"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      </div>

      {isDragOver ? (
        <p className="text-sm font-medium text-blue-400">Drop files here</p>
      ) : (
        <>
          <div>
            <p className="text-sm font-medium text-zinc-200">
              Drag &amp; drop files here, or{' '}
              <span className="text-blue-400 underline underline-offset-2">browse</span>
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Max {MAX_UPLOAD_SIZE_MB} MB per file — images, videos, audio, documents, archives
            </p>
          </div>
        </>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_FILE_TYPES}
        className="sr-only"
        onChange={onInputChange}
        tabIndex={-1}
        disabled={disabled}
      />
    </div>
  );
}
