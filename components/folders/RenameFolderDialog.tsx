'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { FolderItem } from '@/types';

interface RenameFolderDialogProps {
  isOpen: boolean;
  folder: FolderItem | null;
  onConfirm: (id: string, name: string) => Promise<void>;
  onCancel: () => void;
}

export function RenameFolderDialog({
  isOpen,
  folder,
  onConfirm,
  onCancel,
}: RenameFolderDialogProps): React.JSX.Element | null {
  // Initialise name directly from the folder prop so there is no need
  // to call setState inside a useEffect body (avoids set-state-in-effect).
  // The parent re-keys this component on every new folder selection, so
  // state resets automatically on each open.
  const [name, setName] = useState<string>(folder?.name ?? '');
  const [isRenaming, setIsRenaming] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus and select text when the dialog opens.
  // Only a DOM side-effect — no setState — which is exactly what effects
  // are intended for.
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && !isRenaming) onCancel();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, isRenaming, onCancel]);

  if (!isOpen || !folder) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Folder name cannot be empty.');
      return;
    }
    if (trimmed === folder.name) {
      onCancel();
      return;
    }
    setIsRenaming(true);
    setError(null);
    try {
      await onConfirm(folder.id, trimmed);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to rename folder.');
      setIsRenaming(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rename-folder-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isRenaming) onCancel();
      }}
    >
      <div
        className={cn(
          'w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl',
          'animate-in fade-in zoom-in-95 duration-150'
        )}
      >
        {/* Icon */}
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-6 w-6 text-zinc-300"
            aria-hidden="true"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        </div>

        {/* Title */}
        <h2
          id="rename-folder-title"
          className="text-center text-lg font-semibold text-white"
        >
          Rename folder
        </h2>

        <form onSubmit={(e) => void handleSubmit(e)} className="mt-4 flex flex-col gap-3">
          <Input
            ref={inputRef}
            type="text"
            placeholder="New folder name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isRenaming}
            aria-label="New folder name"
            maxLength={255}
          />

          {error && (
            <p role="alert" className="rounded-lg bg-red-900/20 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={onCancel}
              disabled={isRenaming}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              isLoading={isRenaming}
              disabled={isRenaming || name.trim().length === 0}
            >
              Rename
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
