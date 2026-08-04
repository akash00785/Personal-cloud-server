# Architecture Overview

## Stack

- **Framework**: Next.js 15 App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 (utility-first, dark-first)
- **Backend / Auth / Storage**: Supabase
- **Deployment**: Render

## Key Decisions

### App Router over Pages Router
Next.js App Router enables React Server Components by default, reducing client-side JS and improving performance. Layouts are persistent and composable.

### Supabase SSR helpers
`@supabase/ssr` is used instead of the deprecated `@supabase/auth-helpers-nextjs`. It provides `createBrowserClient` and `createServerClient` for correct cookie handling in RSC, Server Actions, Route Handlers, and Middleware.

### Dark theme default
The app is designed dark-first using the zinc palette. `color-scheme: dark` is set on `<html>` to ensure system UI elements (scrollbars, inputs) match.

### `cn()` utility
`clsx` + `tailwind-merge` are combined in `lib/utils.ts#cn()` to safely merge Tailwind classes without specificity conflicts.

### Middleware session refresh
`middleware.ts` calls `updateSession()` on every request to keep Supabase auth tokens alive. This is required for SSR auth to work correctly.

## Data Flow

```
Browser → Next.js Middleware (session refresh)
       → App Router (Server Components fetch data via Supabase server client)
       → Client Components (use Supabase browser client for real-time / mutations)
       → Supabase (PostgreSQL + Storage + Auth)
```

## Environment Variables

See `.env.example` for required variables. Never commit `.env.local`.
