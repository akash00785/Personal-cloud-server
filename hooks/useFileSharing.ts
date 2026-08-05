'use client';

// =============================================================
// useFileSharing — hook for managing share links.
// Handles create, list, and revoke operations.
// =============================================================

import { useState, useCallback, useEffect } from 'react';
import type { ShareLinkItem, ShareExpiry } from '@/types';

interface UseFileSharingReturn {
  links: ShareLinkItem[];
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
  fetchLinks: () => void;
  createLink: (expiry: ShareExpiry) => Promise<ShareLinkItem | null>;
  revokeLink: (shareId: string) => Promise<void>;
}

export function useFileSharing(fileId: string | null): UseFileSharingReturn {
  const [links, setLinks] = useState<ShareLinkItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLinks = useCallback((): void => {
    if (!fileId) return;

    setIsLoading(true);
    setError(null);

    fetch(`/api/files/${encodeURIComponent(fileId)}/share`)
      .then(async (res) => {
        const json = (await res.json()) as { data: ShareLinkItem[] | null; error: string | null };
        if (!res.ok || json.error) {
          throw new Error(json.error ?? 'Failed to load share links.');
        }
        setLinks(json.data ?? []);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load share links.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [fileId]);

  // Load links when fileId changes.
  // Wrapped in Promise.resolve so setState calls inside fetchLinks are never
  // synchronous in the effect body (satisfies react-hooks/set-state-in-effect).
  useEffect(() => {
    Promise.resolve().then(() => {
      fetchLinks();
    });
  }, [fetchLinks]);

  const createLink = useCallback(
    async (expiry: ShareExpiry): Promise<ShareLinkItem | null> => {
      if (!fileId) return null;

      setIsCreating(true);
      setError(null);

      try {
        const res = await fetch(`/api/files/${encodeURIComponent(fileId)}/share`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ expiry }),
        });
        const json = (await res.json()) as { data: ShareLinkItem | null; error: string | null };

        if (!res.ok || json.error) {
          throw new Error(json.error ?? 'Failed to create share link.');
        }

        const newLink = json.data!;
        setLinks((prev) => [newLink, ...prev]);
        return newLink;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to create share link.');
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    [fileId]
  );

  const revokeLink = useCallback(
    async (shareId: string): Promise<void> => {
      if (!fileId) return;

      setError(null);

      try {
        const res = await fetch(
          `/api/files/${encodeURIComponent(fileId)}/share/${encodeURIComponent(shareId)}`,
          { method: 'DELETE' }
        );
        const json = (await res.json()) as { error: string | null };

        if (!res.ok || json.error) {
          throw new Error(json.error ?? 'Failed to revoke share link.');
        }

        // Mark the link as revoked in local state (avoids a refetch)
        setLinks((prev) =>
          prev.map((link) =>
            link.id === shareId
              ? { ...link, revokedAt: new Date().toISOString(), status: 'revoked' as const }
              : link
          )
        );
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to revoke share link.');
      }
    },
    [fileId]
  );

  return {
    links,
    isLoading,
    isCreating,
    error,
    fetchLinks,
    createLink,
    revokeLink,
  };
}
