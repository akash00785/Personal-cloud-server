'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { cn } from '@/lib/utils';
import { NAV_ITEMS, APP_NAME } from '@/lib/constants';
import { SignOutButton } from '@/components/auth/SignOutButton';

interface HeaderProps {
  user?: User | null;
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl">
      {/* Subtle top accent line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href={user ? '/dashboard' : '/'}
          className="group flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 rounded-lg px-1"
          aria-label={`${APP_NAME} Home`}
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-blue-600 shadow-sm shadow-emerald-900/40">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <span className="text-base font-bold text-zinc-100 transition-colors group-hover:text-white">
            {APP_NAME}
          </span>
        </Link>

        {/* Nav — only shown when authenticated */}
        {user && (
          <nav className="hidden gap-1 md:flex" aria-label="Main navigation">
            {NAV_ITEMS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all duration-200',
                  pathname.startsWith(href)
                    ? 'bg-zinc-800/80 text-white shadow-sm'
                    : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100'
                )}
                aria-current={pathname.startsWith(href) ? 'page' : undefined}
              >
                {label}
              </Link>
            ))}
          </nav>
        )}

        {/* Right side */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                href="/profile"
                className={cn(
                  'hidden items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 sm:flex',
                  pathname.startsWith('/profile')
                    ? 'bg-zinc-800/80 text-white'
                    : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100'
                )}
                aria-current={pathname.startsWith('/profile') ? 'page' : undefined}
              >
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-blue-600 text-[10px] font-bold text-white uppercase"
                  aria-hidden="true"
                >
                  {(user.email?.split('@')[0] ?? 'U').charAt(0)}
                </span>
                {user.email?.split('@')[0] ?? 'Profile'}
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="rounded-lg px-3.5 py-1.5 text-sm font-medium text-zinc-400 transition-all duration-200 hover:bg-zinc-800/60 hover:text-zinc-100"
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-sm font-medium text-white shadow-sm shadow-emerald-900/30 transition-all duration-200 hover:bg-emerald-500 hover:shadow-emerald-800/40"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
