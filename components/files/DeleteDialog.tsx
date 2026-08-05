'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface DeleteDialogProps {
  isOpen: boolean;
  fileName: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export function DeleteDialog({
  isOpen,
  fileName,
  onConfirm,
  onCancel,
}: DeleteDialogProps): React.JSX.Element | null {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Focus the cancel button when the dialog opens.
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

  if (!isOpen) return null;

  const handleConfirm = async (): Promise<void> => {
    setIsDeleting(true);
    setError(null);
    try {
      await onConfirm();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Deletion failed. Please try again.');
      setIsDeleting(false);
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-desc"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) onCancel();
      }}
    >
      {/* Panel */}
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
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-900/30 bg-red-950/40">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-7 w-7 text-red-400"
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
          id="delete-dialog-title"
          className="text-center text-lg font-semibold text-white"
        >
          Delete file?
        </h2>

        {/* Description */}
        <p id="delete-dialog-desc" className="mt-2 text-center text-sm text-zinc-400 leading-relaxed">
          <span className="font-medium text-zinc-200">&ldquo;{fileName}&rdquo;</span>
          {' '}will be permanently deleted. This action cannot be undone.
        </p>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mt-4 flex items-center gap-2 rounded-xl border border-red-900/40 bg-red-950/40 px-3 py-2.5 text-sm text-red-400"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 shrink-0" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex gap-2.5">
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
            {isDeleting ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  );
}
