'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import type { FolderItem } from '@/types';

interface DeleteFolderDialogProps {
  isOpen: boolean;
  folder: FolderItem | null;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export function DeleteFolderDialog({
  isOpen,
  folder,
  onConfirm,
  onCancel,
}: DeleteFolderDialogProps): React.JSX.Element | null {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Focus the cancel button when the dialog opens.
  // Only a DOM side-effect (focus) — no setState — which is exactly what
  // effects are intended for.
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => cancelRef.current?.focus());
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && !isDeleting) onCancel();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, isDeleting, onCancel]);

  if (!isOpen || !folder) return null;

  const handleConfirm = async (): Promise<void> => {
    setIsDeleting(true);
    setError(null);
    try {
      await onConfirm();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete folder.');
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-folder-title"
      aria-describedby="delete-folder-desc"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) onCancel();
      }}
    >
      <div
        className={cn(
          'w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl',
          'animate-in fade-in zoom-in-95 duration-150'
        )}
      >
        {/* Icon */}
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-900/30">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-6 w-6 text-red-400"
            aria-hidden="true"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </div>

        {/* Title */}
        <h2
          id="delete-folder-title"
          className="text-center text-lg font-semibold text-white"
        >
          Delete folder?
        </h2>

        {/* Description */}
        <p id="delete-folder-desc" className="mt-2 text-center text-sm text-zinc-400">
          <span className="font-medium text-zinc-200">&ldquo;{folder.name}&rdquo;</span> and all
          its sub-folders will be permanently deleted. Files inside will be moved to the root
          level. This action cannot be undone.
        </p>

        {/* Error */}
        {error && (
          <p
            role="alert"
            className="mt-3 rounded-lg bg-red-900/20 px-3 py-2 text-center text-sm text-red-400"
          >
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <Button
            ref={cancelRef}
            variant="secondary"
            className="flex-1"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={() => void handleConfirm()}
            isLoading={isDeleting}
            disabled={isDeleting}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
