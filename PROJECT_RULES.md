# Project Rules

## Code Quality Standards

Every commit to this repository must pass the following checks — **no exceptions**:

```bash
npm install       # Ensure deps are installed
npm run lint      # Zero ESLint errors or warnings
npm run build     # Successful production build
```

---

## Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Files / Folders | `kebab-case` | `user-profile.ts` |
| React Components | `PascalCase` file + export | `UserCard.tsx` |
| Hooks | `camelCase`, prefix `use` | `useLocalStorage.ts` |
| Services | `camelCase.service.ts` | `supabase.service.ts` |
| Types / Interfaces | `PascalCase` | `UserProfile` |
| Constants | `SCREAMING_SNAKE_CASE` | `MAX_UPLOAD_SIZE_MB` |
| CSS classes | Tailwind utility-first only | — |

---

## Folder Rules

| Folder | What belongs here |
|--------|------------------|
| `app/` | Next.js App Router pages, layouts, loading, error, not-found |
| `components/ui/` | Primitive, unstyled-logic UI components (Button, Input, Card…) |
| `components/layout/` | Page-level layout shells (Header, Footer, Sidebar…) |
| `lib/` | Shared utilities, constants, Supabase helpers — no side-effects |
| `hooks/` | Custom React hooks — must start with `use` |
| `services/` | Business logic, external API calls — no React |
| `types/` | Global TypeScript interfaces and type aliases |
| `styles/` | Global CSS additions beyond `app/globals.css` |
| `docs/` | Project documentation, architecture decisions |

---

## TypeScript Rules

- `strict: true` is enabled — never disable it.
- No `any` — use `unknown` and narrow where needed.
- Export types from `types/index.ts`; import from `@/types`.
- Prefer `interface` over `type` for object shapes.
- Always type function return values explicitly.

---

## Styling Rules

- Use **Tailwind CSS utility classes only** — no custom CSS unless unavoidable.
- Dark theme is the default — always design dark-first.
- Use the `cn()` helper (`@/lib/utils`) for conditional classes.
- Responsive breakpoints: `sm` (640px) → `md` (768px) → `lg` (1024px) → `xl` (1280px).

---

## Component Rules

- Server Components by default.
- Add `'use client'` only when the component uses browser APIs, state, or event handlers.
- Keep components small and single-purpose.
- Co-locate component-specific types inside the component file.
- Always provide `displayName` for `forwardRef` components.

---

## Git Rules

- Branch from `main`.
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/):
  - `feat:` — new feature
  - `fix:` — bug fix
  - `chore:` — tooling, deps, config
  - `docs:` — documentation only
  - `refactor:` — code change with no feature or fix
- **Never commit** `.env.local`, secrets, or API keys.
- Every commit must be a clean, passing build.

---

## Environment Variables

- All env vars are documented in `.env.example`.
- `NEXT_PUBLIC_*` variables are exposed to the browser — never put secrets there.
- Server-only secrets (e.g. `SUPABASE_SERVICE_ROLE_KEY`) must never have the `NEXT_PUBLIC_` prefix.

---

## Agent Handoff Protocol

When handing off to the next agent:

1. Update `PROJECT_STATUS.md` with completed tasks, remaining tasks, and installed packages.
2. Update `CHANGELOG.md` with a versioned entry.
3. Update `TODO.md` removing completed items and adding new ones.
4. Run `npm run build` and confirm it passes before the final commit.
5. Push all changes to `main`.
