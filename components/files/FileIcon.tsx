import { cn } from '@/lib/utils';

interface FileIconProps {
  mimeType: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

type FileCategory =
  | 'image'
  | 'video'
  | 'audio'
  | 'pdf'
  | 'document'
  | 'spreadsheet'
  | 'presentation'
  | 'archive'
  | 'code'
  | 'text'
  | 'other';

function getCategory(mimeType: string): FileCategory {
  const m = mimeType.toLowerCase();
  if (m.startsWith('image/')) return 'image';
  if (m.startsWith('video/')) return 'video';
  if (m.startsWith('audio/')) return 'audio';
  if (m === 'application/pdf') return 'pdf';
  if (
    m === 'application/msword' ||
    m === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  )
    return 'document';
  if (
    m === 'application/vnd.ms-excel' ||
    m === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    m === 'text/csv'
  )
    return 'spreadsheet';
  if (
    m === 'application/vnd.ms-powerpoint' ||
    m === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  )
    return 'presentation';
  if (
    m === 'application/zip' ||
    m === 'application/x-7z-compressed' ||
    m === 'application/x-tar' ||
    m === 'application/gzip' ||
    m === 'application/x-rar-compressed'
  )
    return 'archive';
  if (
    m === 'application/json' ||
    m === 'application/xml' ||
    m === 'text/xml' ||
    m === 'text/html' ||
    m === 'text/css' ||
    m === 'text/javascript'
  )
    return 'code';
  if (m.startsWith('text/')) return 'text';
  return 'other';
}

const categoryConfig: Record<
  FileCategory,
  { bg: string; iconColor: string; label: string }
> = {
  image: {
    bg: 'bg-blue-900/40',
    iconColor: 'text-blue-400',
    label: 'IMG',
  },
  video: {
    bg: 'bg-purple-900/40',
    iconColor: 'text-purple-400',
    label: 'VID',
  },
  audio: {
    bg: 'bg-pink-900/40',
    iconColor: 'text-pink-400',
    label: 'AUD',
  },
  pdf: {
    bg: 'bg-red-900/40',
    iconColor: 'text-red-400',
    label: 'PDF',
  },
  document: {
    bg: 'bg-sky-900/40',
    iconColor: 'text-sky-400',
    label: 'DOC',
  },
  spreadsheet: {
    bg: 'bg-emerald-900/40',
    iconColor: 'text-emerald-400',
    label: 'XLS',
  },
  presentation: {
    bg: 'bg-orange-900/40',
    iconColor: 'text-orange-400',
    label: 'PPT',
  },
  archive: {
    bg: 'bg-amber-900/40',
    iconColor: 'text-amber-400',
    label: 'ZIP',
  },
  code: {
    bg: 'bg-teal-900/40',
    iconColor: 'text-teal-400',
    label: 'COD',
  },
  text: {
    bg: 'bg-zinc-800',
    iconColor: 'text-zinc-400',
    label: 'TXT',
  },
  other: {
    bg: 'bg-zinc-800',
    iconColor: 'text-zinc-500',
    label: 'FILE',
  },
};

const sizeDimensions: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
};

const labelSizes: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'text-[8px]',
  md: 'text-[9px]',
  lg: 'text-[11px]',
};

// SVG icons per category
function IconShape({ category, color }: { category: FileCategory; color: string }) {
  switch (category) {
    case 'image':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={cn('h-5 w-5', color)}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-5-5L5 21" />
        </svg>
      );
    case 'video':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={cn('h-5 w-5', color)}>
          <rect x="2" y="6" width="14" height="12" rx="2" />
          <path d="m22 8-6 4 6 4V8Z" />
        </svg>
      );
    case 'audio':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={cn('h-5 w-5', color)}>
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      );
    case 'pdf':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={cn('h-5 w-5', color)}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <path d="M9 13h6M9 17h6M9 9h1" />
        </svg>
      );
    case 'spreadsheet':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={cn('h-5 w-5', color)}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M3 15h18M9 3v18" />
        </svg>
      );
    case 'presentation':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={cn('h-5 w-5', color)}>
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
      );
    case 'archive':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={cn('h-5 w-5', color)}>
          <rect x="2" y="3" width="20" height="5" rx="1" />
          <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
          <path d="M10 12h4" />
        </svg>
      );
    case 'code':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={cn('h-5 w-5', color)}>
          <path d="m16 18 6-6-6-6M8 6l-6 6 6 6" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={cn('h-5 w-5', color)}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
        </svg>
      );
  }
}

export function FileIcon({ mimeType, size = 'md', className }: FileIconProps): React.JSX.Element {
  const category = getCategory(mimeType);
  const config = categoryConfig[category];

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-lg',
        config.bg,
        sizeDimensions[size],
        className
      )}
      aria-hidden="true"
    >
      {size === 'sm' ? (
        <span className={cn('font-bold leading-none', labelSizes[size], config.iconColor)}>
          {config.label}
        </span>
      ) : (
        <IconShape category={category} color={config.iconColor} />
      )}
    </div>
  );
}

/** Returns a short human-readable label for a MIME type */
export function getMimeLabel(mimeType: string): string {
  const m = mimeType.toLowerCase();
  if (m.startsWith('image/')) return m.replace('image/', '').toUpperCase();
  if (m.startsWith('video/')) return m.replace('video/', '').toUpperCase();
  if (m.startsWith('audio/')) return m.replace('audio/', '').toUpperCase();
  if (m === 'application/pdf') return 'PDF';
  if (m === 'application/msword') return 'DOC';
  if (m.includes('wordprocessingml')) return 'DOCX';
  if (m === 'application/vnd.ms-excel') return 'XLS';
  if (m.includes('spreadsheetml')) return 'XLSX';
  if (m === 'application/vnd.ms-powerpoint') return 'PPT';
  if (m.includes('presentationml')) return 'PPTX';
  if (m === 'application/zip') return 'ZIP';
  if (m === 'application/x-7z-compressed') return '7Z';
  if (m === 'application/x-tar') return 'TAR';
  if (m === 'application/gzip') return 'GZ';
  if (m === 'application/x-rar-compressed') return 'RAR';
  if (m === 'text/csv') return 'CSV';
  if (m === 'application/json') return 'JSON';
  if (m === 'text/plain') return 'TXT';
  if (m === 'text/markdown') return 'MD';
  if (m === 'text/html') return 'HTML';
  if (m === 'text/css') return 'CSS';
  if (m === 'text/javascript') return 'JS';
  if (m === 'application/xml' || m === 'text/xml') return 'XML';
  return mimeType.split('/')[1]?.toUpperCase() ?? 'FILE';
}
