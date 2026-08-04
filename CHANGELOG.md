# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

---

## [0.1.0] — 2026-08-04

### Added — Agent-01 (Project Foundation)

- Bootstrapped Next.js 15 project with TypeScript, Tailwind CSS v4, and App Router
- ESLint configuration (Next.js preset)
- Prettier configuration with `prettier-plugin-tailwindcss`
- Full folder structure: `app/`, `components/ui/`, `components/layout/`, `lib/`, `hooks/`, `services/`, `types/`, `styles/`, `public/`, `docs/`
- Supabase client packages (`@supabase/supabase-js`, `@supabase/ssr`)
- Supabase browser client helper (`lib/supabase/client.ts`)
- Supabase server client helper (`lib/supabase/server.ts`)
- Supabase middleware session refresh helper (`lib/supabase/middleware.ts`)
- Next.js middleware (`middleware.ts`) for session token refresh on every request
- Dark theme configuration (zinc palette, `color-scheme: dark`, CSS custom properties)
- Responsive Tailwind layout (sm / md / lg / xl breakpoints)
- UI primitives: `Button`, `Input`, `Card`, `Badge`, `Spinner`
- Layout components: `Header`, `Footer`, `Sidebar`, `PageWrapper`
- Utility library: `cn()`, `formatBytes()`, `formatDate()`, `truncate()`
- App-wide constants: `APP_NAME`, `APP_URL`, `NAV_ITEMS`, upload size limits
- Global TypeScript types: `ApiResponse`, `UserProfile`, `CloudFile`, `NavItem`
- Custom hooks: `useLocalStorage`, `useTheme`, `useMediaQuery`
- Service scaffold: `supabase.service.ts`
- App Router pages: root layout, home, error, not-found, loading
- Documentation: `README.md`, `PROJECT_RULES.md`, `PROJECT_STATUS.md`, `CHANGELOG.md`, `TODO.md`
- Environment variable template: `.env.example`
- `clsx` and `tailwind-merge` for safe class merging
