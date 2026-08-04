'use client';

import { useState, useCallback, useEffect } from 'react';
import type { FileListItem, ApiResponse } from '@/types';

export interface UseFilesReturn {
  files: FileListItem[];
  isLoading: boolean;
  error: string | null;
  fetchFiles: () => void;
  removeFile: (id: string) => Promise<void>;
  downloadFile: (id: string, fileName: string) => Promise<void>;
}

/**
 * Client-side hook for managing the file list.
 *
 * @param folderId - UUID of the current folder, null = root files,
 *                   undefined = all files (no filter, backward-compatible default).
 */
export function useFiles(folderId?: string | null): UseFilesReturn {
  // isLoading starts as true — the effect never needs a synchronous setState call
  const [files, setFiles] = useState<FileListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Build the API URL based on the optional folderId
  const buildUrl = useCallback((): string => {
    if (folderId === undefined) return '/api/files';
    if (folderId === null) return '/api/files?folderId=root';
    return `/api/files?folderId=${encodeURIComponent(folderId)}`;
  }, [folderId]);

  // Internal fetch helper — all setState calls live inside .then()/.catch()
  // callbacks (async), so they are never "synchronous within an effect body".
  // This mirrors the same pattern used in hooks/useAuth.ts.
  const load = useCallback((): void => {
    fetch(buildUrl())
      .then((res) => res.json() as Promise<ApiResponse<FileListItem[]>>)
      .then(({ data, error: apiError }) => {
        if (apiError) {
          setError(apiError);
        } else {
          setFiles(data ?? []);
        }
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load files.');
        setIsLoading(false);
      });
  }, [buildUrl]);

  // Manual refresh — resets loading state then re-fetches.
  // The setIsLoading call is synchronous here but it is called from an event
  // handler (button click), never from inside a useEffect body.
  const fetchFiles = useCallback((): void => {
    setIsLoading(true);
    setError(null);
    load();
  }, [load]);

  // Initial mount / folderId change: start the fetch. We call `load` (not
  // `fetchFiles`) so that no synchronous setState runs in the effect body —
  // all state mutations happen inside Promise callbacks.
  useEffect(() => {
    load();
  }, [load]);

  const removeFile = useCallback(async (id: string): Promise<void> => {
    const res = await fetch(`/api/files/${id}`, { method: 'DELETE' });
    const json = (await res.json()) as ApiResponse<null>;
    if (json.error) throw new Error(json.error);
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const downloadFile = useCallback(
    async (id: string, fileName: string): Promise<void> => {
      const res = await fetch(`/api/files/${id}`);
      const json = (await res.json()) as ApiResponse<{ signedUrl: string }>;
      if (json.error || !json.data)
        throw new Error(json.error ?? 'Failed to get download URL.');

      const a = document.createElement('a');
      a.href = json.data.signedUrl;
      a.download = fileName;
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },
    []
  );

  return { files, isLoading, error, fetchFiles, removeFile, downloadFile };
}
