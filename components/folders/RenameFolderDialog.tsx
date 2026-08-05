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
  const [name, setName] = useState<string>(folder?.name ?? '');
  const [isRenaming, setIsRenaming] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }
  }, [isOpen]);

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="rename-folder-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isRenaming) onCancel();
      }}
    >
      <div
        className={cn(
          'w-full max-w-sm animate-scale-in',
          'rounded-2xl border border-zinc-800/60 bg-zinc-900',
          'shadow-2xl shadow-black/50',
          'ring-1 ring-inset ring-white/[0.04]',
          'p-6'
        )}
      >
        {/* Icon */}
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-700/40 bg-zinc-800/60">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-7 w-7 text-zinc-300"
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
        <p className="mt-1 text-center text-sm text-zinc-500">
          Enter a new name for &ldquo;{folder.name}&rdquo;
        </p>

        <form onSubmit={(e) => void handleSubmit(e)} className="mt-5 flex flex-col gap-3">
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
            <div
              role="alert"
              className="flex items-center gap-2 rounded-xl border border-red-900/40 bg-red-950/40 px-3 py-2 text-sm text-red-400"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 shrink-0" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <div className="flex gap-2.5 pt-1">
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
