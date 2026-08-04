'use client';

import { useState, useCallback, useEffect } from 'react';
import type { FolderItem, BreadcrumbItem, ApiResponse } from '@/types';

export interface UseFoldersReturn {
  folders: FolderItem[];
  breadcrumbs: BreadcrumbItem[];
  isLoading: boolean;
  error: string | null;
  fetchFolders: () => void;
  addFolder: (name: string) => Promise<FolderItem>;
  editFolder: (id: string, name: string) => Promise<void>;
  removeFolder: (id: string) => Promise<void>;
}

/**
 * Client-side hook for managing folders within a given parent.
 *
 * @param parentId - UUID of the current parent folder, or null for root.
 *                   Changing this value triggers an automatic re-fetch.
 */
export function useFolders(parentId: string | null = null): UseFoldersReturn {
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch folders ──────────────────────────────────────────────────────────
  // All setState calls live inside .then()/.catch() callbacks — never
  // synchronous in the effect body (satisfies react-hooks/set-state-in-effect).
  const load = useCallback((): void => {
    const parentParam = parentId ? `parentId=${encodeURIComponent(parentId)}` : 'parentId=root';

    fetch(`/api/folders?${parentParam}`)
      .then((res) => res.json() as Promise<ApiResponse<FolderItem[]>>)
      .then(({ data, error: apiError }) => {
        if (apiError) {
          setError(apiError);
        } else {
          setFolders(data ?? []);
        }
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load folders.');
        setIsLoading(false);
      });
  }, [parentId]);

  // ── Fetch breadcrumbs ──────────────────────────────────────────────────────
  // All setState calls are inside Promise .then()/.catch() callbacks so
  // they are never synchronous within the effect body.
  const loadBreadcrumbs = useCallback((): void => {
    if (parentId === null) {
      // Wrap in Promise.resolve so setState is always asynchronous.
      Promise.resolve([{ id: null, name: 'Files' } as BreadcrumbItem]).then((crumbs) => {
        setBreadcrumbs(crumbs);
      });
      return;
    }

    fetch(`/api/folders/${encodeURIComponent(parentId)}/path`)
      .then((res) => res.json() as Promise<ApiResponse<BreadcrumbItem[]>>)
      .then(({ data }) => {
        setBreadcrumbs(data ?? [{ id: null, name: 'Files' }]);
      })
      .catch(() => {
        setBreadcrumbs([{ id: null, name: 'Files' }]);
      });
  }, [parentId]);

  // ── Manual refresh ────────────────────────────────────────────────────────
  // setIsLoading is called from an event handler (button click), not from
  // inside a useEffect body, so it does not violate set-state-in-effect.
  const fetchFolders = useCallback((): void => {
    setIsLoading(true);
    setError(null);
    load();
    loadBreadcrumbs();
  }, [load, loadBreadcrumbs]);

  // ── Initial + parentId change ─────────────────────────────────────────────
  // Only side-effectful calls here — no synchronous setState in the body.
  useEffect(() => {
    load();
    loadBreadcrumbs();
  }, [load, loadBreadcrumbs]);

  // ── Create ────────────────────────────────────────────────────────────────
  const addFolder = useCallback(
    async (name: string): Promise<FolderItem> => {
      const res = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, parentId }),
      });
      const json = (await res.json()) as ApiResponse<FolderItem>;
      if (json.error || !json.data) {
        throw new Error(json.error ?? 'Failed to create folder.');
      }
      setFolders((prev) =>
        [...prev, json.data!].sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
        )
      );
      return json.data;
    },
    [parentId]
  );

  // ── Rename ────────────────────────────────────────────────────────────────
  const editFolder = useCallback(async (id: string, name: string): Promise<void> => {
    const res = await fetch(`/api/folders/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    const json = (await res.json()) as ApiResponse<FolderItem>;
    if (json.error || !json.data) {
      throw new Error(json.error ?? 'Failed to rename folder.');
    }
    setFolders((prev) =>
      prev
        .map((f) => (f.id === id ? (json.data as FolderItem) : f))
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
    );
  }, []);

  // ── Delete ────────────────────────────────────────────────────────────────
  const removeFolder = useCallback(async (id: string): Promise<void> => {
    const res = await fetch(`/api/folders/${encodeURIComponent(id)}`, { method: 'DELETE' });
    const json = (await res.json()) as ApiResponse<null>;
    if (json.error) throw new Error(json.error);
    setFolders((prev) => prev.filter((f) => f.id !== id));
  }, []);

  return {
    folders,
    breadcrumbs,
    isLoading,
    error,
    fetchFolders,
    addFolder,
    editFolder,
    removeFolder,
  };
}
