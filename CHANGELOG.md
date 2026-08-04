# Changelog

All notable changes to this project will be documented in this file.

---

## [0.2.0] — 2026-08-04

### Agent-02 — Authentication & User System

#### Added
- **`proxy.ts`** — Next.js 16 proxy with session refresh + protected route guards
- **`app/auth/actions.ts`** — Server Actions: `signUp`, `signIn`, `signOut`, `updateProfile`
- **`app/auth/layout.tsx`** — Centered card layout for auth pages
- **`app/auth/login/page.tsx`** — Email/Password login page with error handling
- **`app/auth/signup/page.tsx`** — Email/Password sign-up page with password confirmation
- **`app/auth/callback/route.ts`** — OAuth/email confirmation callback handler
- **`app/(protected)/layout.tsx`** — Server-side auth guard (redirects unauthenticated users)
- **`app/(protected)/dashboard/page.tsx`** — Protected dashboard page with profile greeting
- **`app/(protected)/profile/page.tsx`** — Protected profile page with account info + edit form
- **`components/auth/SignOutButton.tsx`** — Client sign-out button
- **`components/profile/ProfileForm.tsx`** — Client profile edit form
- **`hooks/useAuth.ts`** — Client-side auth state hook using `onAuthStateChange`
- **`services/auth.service.ts`** — Server-side `getProfile()` and `ensureProfile()` helpers
- **`docs/supabase-setup.md`** — SQL migration guide: `profiles` table, RLS policies, trigger

#### Modified
- **`proxy.ts`** — Replaced session-only proxy with full auth guard logic
- **`components/layout/Header.tsx`** — Auth-aware: shows Sign in/up or user name + Sign out
- **`components/layout/Sidebar.tsx`** — Navigation links with active state
- **`app/page.tsx`** — Server Component, auth-aware CTA (Dashboard or Sign up/Sign in)
- **`types/index.ts`** — Added `ProfileRow` interface
- **`lib/constants.ts`** — Added `AUTH_ROUTES` and `PROTECTED_ROUTES` constants
- **`services/supabase.service.ts`** — Re-exports auth service helpers
- **`components/layout/Footer.tsx`** — Minor cleanup
- **`components/layout/PageWrapper.tsx`** — Minor cleanup
- **`.env.example`** — Updated with complete variable list

#### Environment
- **`.env.local`** — Supabase URL and Anon Key configured (not committed)

---

## [0.1.0] — 2026-08-04

### Agent-01 — Foundation

#### Added
- Bootstrapped Next.js 16 with TypeScript, Tailwind CSS v4, App Router
- Configured ESLint (Next.js preset) and Prettier
- Created clean folder structure
- Installed Supabase client packages
- Created Supabase browser, server, and middleware clients
- Configured dark theme
- Created reusable layout and UI components
- Created shared utility library, constants, and global TypeScript types
- Created custom hooks
- Created root layout, home page, error, not-found, loading pages
