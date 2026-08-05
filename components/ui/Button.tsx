import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'emerald' | 'outline';
type Size = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

const variants: Record<Variant, string> = {
  primary: [
    'bg-blue-600 text-white shadow-sm shadow-blue-900/30',
    'hover:bg-blue-500 hover:shadow-blue-800/40',
    'active:bg-blue-700',
    'focus-visible:ring-blue-500/60',
  ].join(' '),
  emerald: [
    'bg-emerald-600 text-white shadow-sm shadow-emerald-900/30',
    'hover:bg-emerald-500 hover:shadow-emerald-800/40',
    'active:bg-emerald-700',
    'focus-visible:ring-emerald-500/60',
  ].join(' '),
  secondary: [
    'bg-zinc-800 text-zinc-100 border border-zinc-700/60',
    'hover:bg-zinc-700 hover:border-zinc-600 hover:text-white',
    'active:bg-zinc-750',
    'focus-visible:ring-zinc-500/60',
  ].join(' '),
  outline: [
    'bg-transparent text-zinc-300 border border-zinc-700/80',
    'hover:bg-zinc-800/70 hover:border-zinc-600 hover:text-white',
    'active:bg-zinc-800',
    'focus-visible:ring-zinc-500/60',
  ].join(' '),
  ghost: [
    'bg-transparent text-zinc-400',
    'hover:bg-zinc-800/70 hover:text-zinc-100',
    'active:bg-zinc-800',
    'focus-visible:ring-zinc-500/60',
  ].join(' '),
  destructive: [
    'bg-red-600/90 text-white shadow-sm shadow-red-900/30',
    'hover:bg-red-500 hover:shadow-red-800/40',
    'active:bg-red-700',
    'focus-visible:ring-red-500/60',
  ].join(' '),
};

const sizes: Record<Size, string> = {
  xs: 'px-2.5 py-1 text-xs gap-1.5 rounded-lg',
  sm: 'px-3.5 py-1.5 text-sm gap-1.5 rounded-xl',
  md: 'px-4 py-2 text-sm gap-2 rounded-xl',
  lg: 'px-5 py-2.5 text-base gap-2 rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center font-medium',
        'transition-all duration-200 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950',
        'disabled:pointer-events-none disabled:opacity-40',
        'select-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading && (
        <span
          aria-hidden="true"
          className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent opacity-80"
        />
      )}
      {children}
    </button>
  )
);

Button.displayName = 'Button';
