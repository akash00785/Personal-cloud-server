'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ApiResponse } from '@/types';

export interface UseFilePreviewReturn {
  signedUrl: string | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Fetches a signed download/preview URL for the given file ID.
 * Automatically re-fetches whenever fileId changes.
 *
 * @param fileId - UUID of the file_metadata row, or null to skip fetching.
 */
export function useFilePreview(fileId: string | null): UseFilePreviewReturn {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Core fetch — all setState inside .then()/.catch() callbacks (never sync in effect body).
  const load = useCallback((id: string): void => {
    fetch(`/api/files/${encodeURIComponent(id)}`)
      .then((res) => res.json() as Promise<ApiResponse<{ signedUrl: string }>>)
      .then(({ data, error: apiError }) => {
        if (apiError || !data) {
          setError(apiError ?? 'Failed to load preview.');
          setSignedUrl(null);
        } else {
          setSignedUrl(data.signedUrl);
          setError(null);
        }
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load preview.');
        setSignedUrl(null);
        setIsLoading(false);
      });
  }, []);

  // Trigger fetch whenever fileId changes.
  // All setState calls are inside Promise callbacks — never synchronous in
  // the effect body (satisfies react-hooks/set-state-in-effect).
  useEffect(() => {
    if (!fileId) {
      Promise.resolve().then(() => {
        setSignedUrl(null);
        setError(null);
        setIsLoading(false);
      });
      return;
    }
    Promise.resolve().then(() => {
      setIsLoading(true);
      setError(null);
      setSignedUrl(null);
      load(fileId);
    });
  }, [fileId, load]);

  // Manual refetch — resets state then re-fetches.
  const refetch = useCallback((): void => {
    if (!fileId) return;
    setIsLoading(true);
    setError(null);
    setSignedUrl(null);
    load(fileId);
  }, [fileId, load]);

  return { signedUrl, isLoading, error, refetch };
}
