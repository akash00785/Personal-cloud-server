import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'emerald';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
}

const variants: Record<BadgeVariant, string> = {
  default:
    'bg-zinc-800/80 text-zinc-300 border border-zinc-700/50',
  success:
    'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50',
  emerald:
    'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60',
  warning:
    'bg-amber-950/60 text-amber-400 border border-amber-800/50',
  error:
    'bg-red-950/60 text-red-400 border border-red-800/50',
  info:
    'bg-blue-950/60 text-blue-400 border border-blue-800/50',
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-zinc-400',
  success: 'bg-emerald-400',
  emerald: 'bg-emerald-300',
  warning: 'bg-amber-400',
  error: 'bg-red-400',
  info: 'bg-blue-400',
};

export function Badge({
  className,
  variant = 'default',
  dot = false,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full shrink-0', dotColors[variant])}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
