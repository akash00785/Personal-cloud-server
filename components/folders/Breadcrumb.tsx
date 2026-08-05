'use client';

import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

interface BreadcrumbProps {
  crumbs: BreadcrumbItem[];
  onNavigate: (folderId: string | null) => void;
}

export function Breadcrumb({ crumbs, onNavigate }: BreadcrumbProps): React.JSX.Element {
  return (
    <nav aria-label="Folder navigation" className="flex flex-wrap items-center gap-1">
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;

        return (
          <span key={crumb.id ?? 'root'} className="flex items-center gap-1">
            {/* Separator — skip for first crumb */}
            {index > 0 && (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-3 w-3 shrink-0 text-zinc-700"
                aria-hidden="true"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            )}

            {/* Crumb button / label */}
            {isLast ? (
              <span
                className="text-sm font-medium text-zinc-100"
                aria-current="page"
              >
                {crumb.name}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate(crumb.id)}
                className={cn(
                  'rounded-lg px-1.5 py-0.5 text-sm font-medium text-zinc-500',
                  'transition-all duration-200 hover:bg-zinc-800/70 hover:text-zinc-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50'
                )}
              >
                {crumb.name}
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
}
