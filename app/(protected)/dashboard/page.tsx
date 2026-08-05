import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { APP_NAME } from '@/lib/constants';

export const metadata: Metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single();

  const displayName = profile?.display_name ?? user?.email?.split('@')[0] ?? 'User';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Welcome hero */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-900/80 p-6 shadow-sm shadow-black/20">
        {/* Subtle gradient accent */}
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse at top left, rgba(16,185,129,0.15) 0%, transparent 60%)',
          }}
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          {/* Avatar */}
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-bold text-white"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
            }}
            aria-hidden="true"
          >
            {initial}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome back, {displayName}
            </h1>
            <p className="mt-0.5 text-sm text-zinc-400">
              Your files and data are securely stored in {APP_NAME}.
            </p>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Storage Overview
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              label: 'Total Files',
              value: '—',
              description: 'Files stored in your cloud',
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 text-blue-400" aria-hidden="true">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              ),
              accentColor: 'from-blue-900/20 to-transparent',
              borderColor: 'border-blue-900/20',
            },
            {
              label: 'Storage Used',
              value: '—',
              description: 'Of your allocated storage',
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 text-emerald-400" aria-hidden="true">
                  <ellipse cx="12" cy="5" rx="9" ry="3" />
                  <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                  <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                </svg>
              ),
              accentColor: 'from-emerald-900/20 to-transparent',
              borderColor: 'border-emerald-900/20',
            },
            {
              label: 'Last Activity',
              value: '—',
              description: 'Most recent file access',
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 text-purple-400" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              ),
              accentColor: 'from-purple-900/20 to-transparent',
              borderColor: 'border-purple-900/20',
            },
          ].map(({ label, value, description, icon, accentColor, borderColor }) => (
            <div
              key={label}
              className={`relative overflow-hidden rounded-2xl border bg-zinc-900/80 p-5 shadow-sm shadow-black/20 ${borderColor}`}
            >
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accentColor} opacity-50`}
                aria-hidden="true"
              />
              <div className="relative">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-medium text-zinc-500">{label}</p>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-800/60">
                    {icon}
                  </div>
                </div>
                <p className="text-3xl font-bold tracking-tight text-white">{value}</p>
                <p className="mt-1 text-xs text-zinc-600">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Quick Actions
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Upload files */}
          <Link
            href="/files"
            className="group flex items-center gap-4 rounded-2xl border border-zinc-800/60 bg-zinc-900/80 p-5 shadow-sm shadow-black/20 transition-all duration-200 hover:border-emerald-800/30 hover:bg-zinc-800/70 hover:shadow-md"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-900/30 bg-emerald-950/40 transition-all duration-200 group-hover:scale-105">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6 text-emerald-400" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-zinc-100 transition-colors group-hover:text-white">
                Upload Files
              </p>
              <p className="mt-0.5 text-sm text-zinc-500">
                Add files to your personal cloud
              </p>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-auto h-4 w-4 shrink-0 text-zinc-700 transition-all duration-200 group-hover:text-zinc-400 group-hover:translate-x-0.5" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>

          {/* Profile */}
          <Link
            href="/profile"
            className="group flex items-center gap-4 rounded-2xl border border-zinc-800/60 bg-zinc-900/80 p-5 shadow-sm shadow-black/20 transition-all duration-200 hover:border-blue-800/30 hover:bg-zinc-800/70 hover:shadow-md"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-900/30 bg-blue-950/40 transition-all duration-200 group-hover:scale-105">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6 text-blue-400" aria-hidden="true">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-zinc-100 transition-colors group-hover:text-white">
                My Profile
              </p>
              <p className="mt-0.5 text-sm text-zinc-500">
                Update your account settings
              </p>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-auto h-4 w-4 shrink-0 text-zinc-700 transition-all duration-200 group-hover:text-zinc-400 group-hover:translate-x-0.5" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
