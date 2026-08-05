import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-zinc-300">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={cn(
          'w-full rounded-xl border bg-zinc-900/80 px-3.5 py-2.5 text-sm text-zinc-100',
          'border-zinc-700/60 placeholder:text-zinc-500',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-600/60',
          'hover:border-zinc-600/80',
          'disabled:pointer-events-none disabled:opacity-40',
          error && 'border-red-500/60 focus:ring-red-500/40 focus:border-red-500/60',
          className
        )}
        {...props}
      />
      {hint && !error && (
        <p className="text-xs text-zinc-500">{hint}</p>
      )}
      {error && (
        <p role="alert" className="flex items-center gap-1.5 text-xs text-red-400">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-3.5 w-3.5 shrink-0"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
);

Input.displayName = 'Input';
