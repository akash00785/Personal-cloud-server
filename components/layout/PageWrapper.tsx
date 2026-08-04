import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
}

export function PageWrapper({ children, className, title, description }: PageWrapperProps) {
  return (
    <main className={cn('flex-1 overflow-y-auto', className)}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {(title || description) && (
          <div className="mb-8">
            {title && <h1 className="text-2xl font-bold text-white">{title}</h1>}
            {description && <p className="mt-1 text-sm text-zinc-400">{description}</p>}
          </div>
        )}
        {children}
      </div>
    </main>
  );
}
