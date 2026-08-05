'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { formatBytes, formatDate } from '@/lib/utils';
import { FileIcon, getMimeLabel } from '@/components/files/FileIcon';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useFilePreview } from '@/hooks/useFilePreview';
import type { FileListItem } from '@/types';

// ─── Previewable type detection ───────────────────────────────────────────────

type PreviewKind = 'image' | 'pdf' | 'video' | 'audio' | 'none';

function getPreviewKind(mimeType: string): PreviewKind {
  const m = mimeType.toLowerCase();
  if (
    m === 'image/jpeg' ||
    m === 'image/jpg' ||
    m === 'image/png' ||
    m === 'image/gif' ||
    m === 'image/webp' ||
    m === 'image/svg+xml' ||
    m === 'image/bmp' ||
    m === 'image/tiff'
  )
    return 'image';
  if (m === 'application/pdf') return 'pdf';
  if (m === 'video/mp4' || m === 'video/webm' || m === 'video/ogg' || m === 'video/quicktime')
    return 'video';
  if (
    m === 'audio/mpeg' ||
    m === 'audio/mp3' ||
    m === 'audio/wav' ||
    m === 'audio/ogg' ||
    m === 'audio/flac' ||
    m === 'audio/aac' ||
    m === 'audio/webm'
  )
    return 'audio';
  return 'none';
}

export function isPreviewable(mimeType: string): boolean {
  return getPreviewKind(mimeType) !== 'none';
}

// ─── Preview content renderers ────────────────────────────────────────────────

function ImagePreview({ src, alt }: { src: string; alt: string }): React.JSX.Element {
  const [imgError, setImgError] = useState<boolean>(false);

  if (imgError) {
    return (
      <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-3 text-zinc-500">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-10 w-10" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-5-5L5 21" />
        </svg>
        <p className="text-sm">Could not load image preview.</p>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      onError={() => setImgError(true)}
      className="max-h-full max-w-full rounded-xl object-contain"
      draggable={false}
    />
  );
}

function PdfPreview({ src }: { src: string }): React.JSX.Element {
  return (
    <iframe
      src={src}
      title="PDF Preview"
      className="h-full w-full rounded-xl border-0"
      aria-label="PDF document preview"
    />
  );
}

function VideoPreview({ src, mimeType }: { src: string; mimeType: string }): React.JSX.Element {
  return (
    <video
      src={src}
      controls
      preload="metadata"
      className="max-h-full max-w-full rounded-xl"
      aria-label="Video preview"
    >
      <source src={src} type={mimeType} />
      Your browser does not support video playback.
    </video>
  );
}

function AudioPreview({ src, mimeType, fileName }: { src: string; mimeType: string; fileName: string }): React.JSX.Element {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-6 py-8">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-emerald-900/30 bg-emerald-950/40">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-10 w-10 text-emerald-400" aria-hidden="true">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      </div>
      <p className="max-w-xs truncate text-center text-sm font-medium text-zinc-300" title={fileName}>
        {fileName}
      </p>
      <audio
        src={src}
        controls
        preload="metadata"
        className="w-full max-w-md"
        aria-label="Audio preview"
      >
        <source src={src} type={mimeType} />
        Your browser does not support audio playback.
      </audio>
    </div>
  );
}

function NoPreview({ mimeType }: { mimeType: string }): React.JSX.Element {
  return (
    <div className="flex h-full min-h-[220px] flex-col items-center justify-center gap-4 text-zinc-500">
      <FileIcon mimeType={mimeType} size="lg" />
      <div className="text-center">
        <p className="text-sm font-medium text-zinc-400">Preview not available</p>
        <p className="mt-1 text-xs text-zinc-600">
          {getMimeLabel(mimeType)} files cannot be previewed in the browser.
        </p>
      </div>
    </div>
  );
}

// ─── Info panel ───────────────────────────────────────────────────────────────

function InfoPanel({ file }: { file: FileListItem }): React.JSX.Element {
  const rows: { label: string; value: string }[] = [
    { label: 'File Name', value: file.fileName },
    { label: 'Type', value: getMimeLabel(file.mimeType) },
    { label: 'MIME Type', value: file.mimeType },
    { label: 'Size', value: formatBytes(file.fileSize) },
    { label: 'Uploaded', value: formatDate(file.createdAt) },
  ];

  return (
    <div className="flex flex-col divide-y divide-zinc-800/60">
      {rows.map(({ label, value }) => (
        <div key={label} className="flex flex-col gap-0.5 px-5 py-3">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
            {label}
          </dt>
          <dd className="break-all text-sm text-zinc-200" title={value}>
            {value}
          </dd>
        </div>
      ))}
    </div>
  );
}

// ─── Main dialog ──────────────────────────────────────────────────────────────

interface PreviewDialogProps {
  isOpen: boolean;
  file: FileListItem | null;
  onClose: () => void;
  onDownload: (id: string, fileName: string) => Promise<void>;
  onShare: (file: FileListItem) => void;
}

export function PreviewDialog({
  isOpen,
  file,
  onClose,
  onDownload,
  onShare,
}: PreviewDialogProps): React.JSX.Element | null {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const { signedUrl, isLoading, error } = useFilePreview(
    isOpen && file ? file.id : null
  );

  const kind = file ? getPreviewKind(file.mimeType) : 'none';

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

  useEffect(() => {
    Promise.resolve().then(() => {
      setDownloadError(null);
    });
  }, [file]);

  const handleDownload = useCallback(async (): Promise<void> => {
    if (!file) return;
    setIsDownloading(true);
    setDownloadError(null);
    try {
      await onDownload(file.id, file.fileName);
    } catch (err: unknown) {
      setDownloadError(err instanceof Error ? err.message : 'Download failed.');
      setTimeout(() => setDownloadError(null), 4000);
    } finally {
      setIsDownloading(false);
    }
  }, [file, onDownload]);

  if (!isOpen || !file) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-dialog-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Panel */}
      <div
        className={cn(
          'flex w-full flex-col',
          'rounded-t-2xl border border-zinc-800/60 bg-zinc-900',
          'sm:max-w-3xl sm:rounded-2xl lg:max-w-5xl',
          'max-h-[95dvh] sm:max-h-[88vh]',
          'shadow-2xl shadow-black/60',
          'ring-1 ring-inset ring-white/[0.04]',
          'overflow-hidden',
          'animate-scale-in'
        )}
      >
        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex shrink-0 items-center gap-3 border-b border-zinc-800/60 bg-zinc-900/80 px-5 py-3.5">
          <FileIcon mimeType={file.mimeType} size="sm" className="shrink-0" />
          <div className="min-w-0 flex-1">
            <h2
              id="preview-dialog-title"
              className="truncate text-sm font-semibold text-zinc-100"
              title={file.fileName}
            >
              {file.fileName}
            </h2>
            <p className="text-xs text-zinc-500">
              {getMimeLabel(file.mimeType)} · {formatBytes(file.fileSize)}
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
            aria-label="Close preview"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ── Body ──────────────────────────────────────────────────────── */}
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          {/* Preview area */}
          <div
            className={cn(
              'flex min-h-0 flex-1 items-center justify-center overflow-hidden',
              kind === 'pdf'
                ? 'h-[50vh] md:h-auto'
                : kind === 'audio'
                  ? 'py-4'
                  : 'p-4 sm:p-6',
              'bg-zinc-950/80'
            )}
          >
            {isLoading && (
              <div className="flex flex-col items-center gap-3">
                <Spinner size="lg" color="emerald" />
                <p className="text-sm text-zinc-500">Loading preview…</p>
              </div>
            )}

            {!isLoading && error && (
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-red-900/30 bg-red-950/40">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7 text-red-400" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {!isLoading && !error && signedUrl && (
              <>
                {kind === 'image' && <ImagePreview src={signedUrl} alt={file.fileName} />}
                {kind === 'pdf' && <PdfPreview src={signedUrl} />}
                {kind === 'video' && <VideoPreview src={signedUrl} mimeType={file.mimeType} />}
                {kind === 'audio' && <AudioPreview src={signedUrl} mimeType={file.mimeType} fileName={file.fileName} />}
                {kind === 'none' && <NoPreview mimeType={file.mimeType} />}
              </>
            )}

            {!isLoading && !error && !signedUrl && kind === 'none' && (
              <NoPreview mimeType={file.mimeType} />
            )}
          </div>

          {/* Info sidebar */}
          <aside
            className="shrink-0 overflow-y-auto border-t border-zinc-800/60 md:w-60 md:border-l md:border-t-0"
            aria-label="File information"
          >
            <div className="border-b border-zinc-800/60 bg-zinc-900/60 px-5 py-3">
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                File Information
              </h3>
            </div>
            <dl>
              <InfoPanel file={file} />
            </dl>
          </aside>
        </div>

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <div className="shrink-0 border-t border-zinc-800/60 bg-zinc-900/60 px-5 py-3.5">
          {downloadError && (
            <div
              role="alert"
              className="mb-3 flex items-center gap-2 rounded-xl border border-red-900/40 bg-red-950/40 px-3 py-2 text-sm text-red-400"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 shrink-0" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {downloadError}
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            <Button variant="ghost" size="sm" onClick={onClose} className="text-zinc-400 hover:text-zinc-200">
              Close
            </Button>

            <div className="flex items-center gap-2">
              {/* Share button */}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onShare(file)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5" aria-hidden="true">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                Share
              </Button>

              {/* Download button */}
              <Button
                variant="emerald"
                size="sm"
                onClick={() => void handleDownload()}
                disabled={isDownloading}
                isLoading={isDownloading}
              >
                {!isDownloading && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                )}
                {isDownloading ? 'Downloading…' : 'Download'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
