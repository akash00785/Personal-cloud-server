'use client';

// =============================================================
// ShareDialog — generate, copy, and revoke share links for a file.
// =============================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useFileSharing } from '@/hooks/useFileSharing';
import { SHARE_EXPIRY_OPTIONS, SHARE_EXPIRY_LABELS } from '@/lib/constants';
import type { FileListItem, ShareExpiry, ShareStatus } from '@/types';

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ShareStatus }): React.JSX.Element {
  const map: Record<ShareStatus, { label: string; className: string; dotColor: string }> = {
    active: {
      label: 'Active',
      className: 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50',
      dotColor: 'bg-emerald-400',
    },
    expired: {
      label: 'Expired',
      className: 'bg-amber-950/40 text-amber-400 border border-amber-800/40',
      dotColor: 'bg-amber-400',
    },
    revoked: {
      label: 'Revoked',
      className: 'bg-red-950/40 text-red-400 border border-red-900/40',
      dotColor: 'bg-red-400',
    },
  };
  const { label, className, dotColor } = map[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', dotColor)} aria-hidden="true" />
      {label}
    </span>
  );
}

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }): React.JSX.Element {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = useCallback((): void => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        // Fallback for browsers without clipboard API
        const el = document.createElement('textarea');
        el.value = text;
        el.style.position = 'fixed';
        el.style.opacity = '0';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className={cn(
        'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border',
        'transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50',
        copied
          ? 'border-emerald-700/60 bg-emerald-950/50 text-emerald-400'
          : 'border-zinc-700/60 bg-zinc-800/80 text-zinc-400 hover:border-zinc-600/80 hover:text-white'
      )}
      aria-label={copied ? 'Copied!' : 'Copy link'}
      title={copied ? 'Copied!' : 'Copy link'}
    >
      {copied ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5" aria-hidden="true">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5" aria-hidden="true">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  );
}

// ─── Main dialog ──────────────────────────────────────────────────────────────

interface ShareDialogProps {
  isOpen: boolean;
  file: FileListItem | null;
  onClose: () => void;
}

export function ShareDialog({ isOpen, file, onClose }: ShareDialogProps): React.JSX.Element | null {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [selectedExpiry, setSelectedExpiry] = useState<ShareExpiry>('24h');

  const { links, isLoading, isCreating, error, createLink, revokeLink } = useFileSharing(
    isOpen && file ? file.id : null
  );

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => closeRef.current?.focus());
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleCreate = useCallback(async (): Promise<void> => {
    await createLink(selectedExpiry);
  }, [createLink, selectedExpiry]);

  const handleRevoke = useCallback(
    async (shareId: string): Promise<void> => {
      await revokeLink(shareId);
    },
    [revokeLink]
  );

  if (!isOpen || !file) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-dialog-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Panel */}
      <div
        className={cn(
          'flex w-full flex-col',
          'rounded-t-2xl border border-zinc-800/60 bg-zinc-900',
          'sm:max-w-lg sm:rounded-2xl',
          'max-h-[90dvh] sm:max-h-[80vh]',
          'shadow-2xl shadow-black/60',
          'ring-1 ring-inset ring-white/[0.04]',
          'overflow-hidden',
          'animate-scale-in'
        )}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex shrink-0 items-center gap-3 border-b border-zinc-800/60 bg-zinc-900/80 px-5 py-3.5">
          {/* Share icon */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-emerald-900/30 bg-emerald-950/40">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-emerald-400" aria-hidden="true">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </div>

          <div className="min-w-0 flex-1">
            <h2 id="share-dialog-title" className="truncate text-sm font-semibold text-zinc-100">
              Share File
            </h2>
            <p className="truncate text-xs text-zinc-500" title={file.fileName}>
              {file.fileName}
            </p>
          </div>

          {/* Close */}
          <button
            ref={closeRef}
            onClick={onClose}
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl',
              'border border-zinc-700/60 bg-zinc-800/80 text-zinc-400',
              'transition-all duration-200 hover:border-zinc-600/80 hover:bg-zinc-700/80 hover:text-white',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50'
            )}
            aria-label="Close share dialog"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {/* Generate new link */}
          <div className="border-b border-zinc-800/60 px-5 py-4">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Generate New Link
            </p>

            {/* Expiry picker */}
            <div className="mb-3 flex flex-wrap gap-1.5">
              {SHARE_EXPIRY_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSelectedExpiry(opt as ShareExpiry)}
                  className={cn(
                    'rounded-xl border px-3 py-1.5 text-xs font-medium transition-all duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50',
                    selectedExpiry === opt
                      ? 'border-emerald-700/60 bg-emerald-950/60 text-emerald-300'
                      : 'border-zinc-700/50 bg-zinc-800/60 text-zinc-400 hover:border-zinc-600/80 hover:text-zinc-200'
                  )}
                  aria-pressed={selectedExpiry === opt}
                >
                  {SHARE_EXPIRY_LABELS[opt]}
                </button>
              ))}
            </div>

            {/* Create button */}
            <Button
              variant="emerald"
              size="sm"
              onClick={() => void handleCreate()}
              disabled={isCreating}
              isLoading={isCreating}
            >
              {!isCreating && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5" aria-hidden="true">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              )}
              {isCreating ? 'Generating…' : 'Generate Link'}
            </Button>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="mt-3 flex items-center gap-2 rounded-xl border border-red-900/40 bg-red-950/40 px-3 py-2 text-xs text-red-400"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}
          </div>

          {/* Existing links */}
          <div className="flex-1 px-5 py-4">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Existing Links
            </p>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner size="sm" color="emerald" />
              </div>
            ) : links.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800/60 bg-zinc-800/40">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 text-zinc-600" aria-hidden="true">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                </div>
                <p className="text-sm text-zinc-600">No share links yet. Generate one above.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {links.map((link) => (
                  <li
                    key={link.id}
                    className="rounded-xl border border-zinc-800/60 bg-zinc-950/60 px-3 py-3"
                  >
                    {/* URL row */}
                    <div className="mb-2 flex items-center gap-2">
                      <p
                        className="min-w-0 flex-1 truncate font-mono text-[11px] text-zinc-500"
                        title={link.shareUrl}
                      >
                        {link.shareUrl}
                      </p>
                      {link.status === 'active' && <CopyButton text={link.shareUrl} />}
                    </div>

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <StatusBadge status={link.status} />
                        <span className="text-[10px] text-zinc-600">
                          Created {formatDate(link.createdAt)}
                        </span>
                        {link.expiresAt && (
                          <span className="text-[10px] text-zinc-600">
                            · Expires {formatDate(link.expiresAt)}
                          </span>
                        )}
                        {!link.expiresAt && link.status === 'active' && (
                          <span className="text-[10px] text-zinc-600">· Never expires</span>
                        )}
                      </div>

                      {/* Revoke — only for active links */}
                      {link.status === 'active' && (
                        <button
                          onClick={() => void handleRevoke(link.id)}
                          className={cn(
                            'flex items-center gap-1 rounded-lg border px-2 py-1',
                            'border-zinc-700/50 bg-zinc-800/60 text-[11px] font-medium text-zinc-400',
                            'transition-all duration-200 hover:border-red-800/60 hover:bg-red-950/40 hover:text-red-400',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50'
                          )}
                          aria-label="Revoke this share link"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3" aria-hidden="true">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                          Revoke
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div className="shrink-0 border-t border-zinc-800/60 bg-zinc-900/60 px-5 py-3.5">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-zinc-400 hover:text-zinc-200">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
