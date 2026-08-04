'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface CreateFolderDialogProps {
  isOpen: boolean;
  onConfirm: (name: string) => Promise<void>;
  onCancel: () => void;
}

export function CreateFolderDialog({
  isOpen,
  onConfirm,
  onCancel,
}: CreateFolderDialogProps): React.JSX.Element | null {
  const [name, setName] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input when the dialog opens.
  // Only a DOM side-effect (focus) — no setState — which is exactly what
  // effects are intended for.
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && !isCreating) onCancel();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, isCreating, onCancel]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Folder name cannot be empty.');
      return;
    }
    setIsCreating(true);
    setError(null);
    try {
      await onConfirm(trimmed);
      setName('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create folder.');
      setIsCreating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-folder-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isCreating) onCancel();
      }}
    >
      <div
        className={cn(
          'w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl',
          'animate-in fade-in zoom-in-95 duration-150'
        )}
      >
        {/* Icon */}
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-900/30">
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-6 w-6 text-amber-400"
            aria-hidden="true"
          >
            <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
          </svg>
        </div>

        {/* Title */}
        <h2
          id="create-folder-title"
          className="text-center text-lg font-semibold text-white"
        >
          New folder
        </h2>

        <form onSubmit={(e) => void handleSubmit(e)} className="mt-4 flex flex-col gap-3">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Folder name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isCreating}
            aria-label="Folder name"
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
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              isLoading={isCreating}
              disabled={isCreating || name.trim().length === 0}
            >
              Create
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
