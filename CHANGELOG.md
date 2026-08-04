# Changelog

All notable changes to this project will be documented in this file.

---

## [0.2.1] — 2026-08-04

### Agent-02 — Security Audit & Hardening

#### Fixed
- **Open Redirect (CWE-601)** — `app/auth/login/page.tsx` was using the raw `redirectTo` query parameter directly with `router.push()`, allowing an attacker to craft a link like `/auth/login?redirectTo=https://evil.com` that redirects users to arbitrary external sites after login. Fixed by routing all redirects through the new `sanitizeRedirectPath()` helper which enforces relative-paths-only.

- **Missing server-side input validation** — `app/auth/actions.ts` accepted form inputs and passed them to Supabase without any server-side checks. A malformed or excessively long input could cause unexpected errors or be used for enumeration. Fixed by adding explicit validation for email format, password length, display name length/character set, and avatar URL protocol (HTTPS only).

#### Added
- **`lib/validation.ts`** — Shared, pure validation utilities used by Server Actions:
  - `isValidEmail(email)` — RFC 5322 simplified format check
  - `isValidPassword(password)` — minimum 8-character enforcement
  - `isValidDisplayName(name)` — length cap (80 chars) and control-character rejection
  - `isValidAvatarUrl(url)` — HTTPS-only URL enforcement
  - `sanitizeRedirectPath(input, fallback)` — rejects external URLs, protocol-relative URLs (`//`), and encoded-slash bypass attempts (`/%2F`)

---

## [0.2.0] — 2026-08-04

### Agent-02 — Authentication & User System

#### Added
- `proxy.ts` — Next.js 16 proxy with session refresh + protected route guards
- `app/auth/actions.ts` — Server Actions: `signUp`, `signIn`, `signOut`, `updateProfile`
- `app/auth/layout.tsx` — Centered card layout for auth pages
- `app/auth/login/page.tsx` — Email/Password login
- `app/auth/signup/page.tsx` — Email/Password sign-up with password confirmation
- `app/auth/callback/route.ts` — OAuth/email confirmation callback handler
- `app/(protected)/layout.tsx` — Server-side auth guard (2nd layer protection)
- `app/(protected)/dashboard/page.tsx` — Protected dashboard page
- `app/(protected)/profile/page.tsx` — Protected profile page
- `components/auth/SignOutButton.tsx` — Client sign-out button
- `components/profile/ProfileForm.tsx` — Client profile edit form
- `hooks/useAuth.ts` — Client-side auth state hook
- `services/auth.service.ts` — `getProfile()`, `ensureProfile()` server helpers
- `docs/supabase-setup.md` — SQL migration: `profiles` table, RLS policies, trigger

#### Modified
- `components/layout/Header.tsx` — Auth-aware UI
- `components/layout/Sidebar.tsx` — Active-state navigation
- `app/page.tsx` — Server Component, auth-aware CTA
- `types/index.ts` — Added `ProfileRow`
- `lib/constants.ts` — Added `AUTH_ROUTES`, `PROTECTED_ROUTES`

---

## [0.1.0] — 2026-08-04

### Agent-01 — Foundation

#### Added
- Bootstrapped Next.js 16 with TypeScript, Tailwind CSS v4, App Router
- ESLint, Prettier, dark theme, responsive layout
- Supabase browser/server/middleware clients
- Reusable UI and layout components
- Custom hooks, utilities, constants, global types
