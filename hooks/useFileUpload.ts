'use client';

import { useState, useCallback } from 'react';
import type { UploadingFile } from '@/types';

function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}

function uploadWithProgress(
  file: File,
  folderId: string | null,
  onProgress: (progress: number) => void
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const form = new FormData();
    form.append('file', file);

    // Include folderId so the file lands in the current folder, not root
    if (folderId !== null) {
      form.append('folderId', folderId);
    }

    xhr.upload.addEventListener('progress', (e: ProgressEvent) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 201) {
        resolve();
      } else {
        try {
          const resp = JSON.parse(xhr.responseText) as { error?: string };
          reject(new Error(resp.error ?? 'Upload failed.'));
        } catch {
          reject(new Error('Upload failed.'));
        }
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload.'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload was aborted.'));
    });

    xhr.open('POST', '/api/files/upload');
    xhr.send(form);
  });
}

export interface UseFileUploadReturn {
  queue: UploadingFile[];
  upload: (files: File[]) => Promise<void>;
  clearQueue: () => void;
  hasActive: boolean;
}

/**
 * Hook for managing multi-file uploads with per-file progress tracking.
 *
 * @param onComplete - Called after at least one file uploads successfully.
 * @param folderId   - UUID of the destination folder, or null for root.
 *                     Must match the currently-viewed folder so files appear
 *                     in the right place immediately after upload.
 */
export function useFileUpload(
  onComplete: () => void,
  folderId: string | null = null
): UseFileUploadReturn {
  const [queue, setQueue] = useState<UploadingFile[]>([]);

  const upload = useCallback(
    async (files: File[]): Promise<void> => {
      const newItems: UploadingFile[] = files.map((f) => ({
        id: generateId(),
        name: f.name,
        size: f.size,
        progress: 0,
        status: 'pending' as const,
      }));

      setQueue((prev) => [...prev, ...newItems]);

      const update = (id: string, patch: Partial<UploadingFile>): void => {
        setQueue((prev) =>
          prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
        );
      };

      let anySuccess = false;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const itemId = newItems[i].id;

        update(itemId, { status: 'uploading' });

        try {
          await uploadWithProgress(file, folderId, (progress) => {
            update(itemId, { progress });
          });
          update(itemId, { status: 'done', progress: 100 });
          anySuccess = true;
        } catch (err: unknown) {
          update(itemId, {
            status: 'error',
            error: err instanceof Error ? err.message : 'Upload failed.',
          });
        }
      }

      if (anySuccess) {
        onComplete();
      }

      // Auto-remove completed items after 3 seconds
      setTimeout(() => {
        setQueue((prev) => prev.filter((item) => item.status !== 'done'));
      }, 3000);
    },
    [onComplete, folderId]
  );

  const clearQueue = useCallback((): void => {
    setQueue([]);
  }, []);

  const hasActive = queue.some(
    (item) => item.status === 'uploading' || item.status === 'pending'
  );

  return { queue, upload, clearQueue, hasActive };
}
