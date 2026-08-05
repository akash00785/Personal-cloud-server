import { cn } from '@/lib/utils';

interface SpinnerProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: 'default' | 'emerald' | 'blue' | 'white';
}

const sizes = {
  xs: 'h-3 w-3 border-[1.5px]',
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-9 w-9 border-[3px]',
};

const colors = {
  default: 'border-zinc-600 border-t-zinc-300',
  emerald: 'border-emerald-900/40 border-t-emerald-400',
  blue: 'border-blue-900/40 border-t-blue-400',
  white: 'border-white/20 border-t-white',
};

export function Spinner({ className, size = 'md', color = 'emerald' }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        'inline-block animate-spin rounded-full',
        sizes[size],
        colors[color],
        className
      )}
    />
  );
}
