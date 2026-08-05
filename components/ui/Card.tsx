import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'glass' | 'elevated';
}

export function Card({
  className,
  variant = 'default',
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl p-5',
        variant === 'default' && [
          'bg-zinc-900 border border-zinc-800/60',
          'shadow-sm shadow-black/20',
        ],
        variant === 'bordered' && [
          'bg-zinc-900/80 border border-zinc-800/80',
          'shadow-sm shadow-black/20',
        ],
        variant === 'glass' && [
          'bg-zinc-900/60 border border-zinc-700/30',
          'backdrop-blur-md',
          'shadow-lg shadow-black/30',
          'ring-1 ring-inset ring-white/[0.04]',
        ],
        variant === 'elevated' && [
          'bg-zinc-900 border border-zinc-800/60',
          'shadow-xl shadow-black/30',
        ],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mb-4 flex flex-col gap-1.5', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-base font-semibold text-zinc-100', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('text-sm text-zinc-400', className)} {...props}>
      {children}
    </div>
  );
}
