import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

interface PageWrapperProps extends HTMLAttributes<HTMLDivElement> {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '5xl' | '7xl';
}

const maxWidths: Record<NonNullable<PageWrapperProps['maxWidth']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '5xl': 'max-w-5xl',
  '7xl': 'max-w-7xl',
};

export function PageWrapper({
  className,
  maxWidth = '7xl',
  children,
  ...props
}: PageWrapperProps) {
  return (
    <div
      className={cn('mx-auto w-full px-4 py-6 sm:px-6 lg:px-8', maxWidths[maxWidth], className)}
      {...props}
    >
      {children}
    </div>
  );
}
