# task-management-web — AGENTS.md

## Stack
- **React 19, TypeScript 6, Vite 8, pnpm** (not npm/yarn)
- Tailwind CSS v4 via `@tailwindcss/vite` (no postcss.config, no tailwind.config)
- React Compiler enabled via `@rolldown/plugin-babel`
- shadcn/ui – `radix-vega` style, lucide icons, 16 components in `src/components/ui/`
- React Router v7, TanStack React Query v4, Zustand v5, react-hook-form + zod v4

## Commands

| Command | What |
|---|---|
| `pnpm dev` | Vite dev server |
| `pnpm build` | `tsc -b && vite build` (typecheck **before** build) |
| `pnpm lint` | `eslint .` (flat config v10) |
| `pnpm test` | `vitest run` |
| `pnpm test:watch` | `vitest` (interactive) |
| `pnpm test:coverage` | `vitest run --coverage` (v8) |

`pnpm build` will fail if tsc errors – always run `pnpm lint && pnpm test` before commit.

## Architecture

```
src/
  api/          Axios client modules (JWT attached via interceptor)
  components/   layout/, shared/, ui/ (shadcn)
  hooks/        React Query hooks (useAuth, useOrganizations, useProjects, useTasks)
  lib/          axios.ts (api client), utils.ts (cn helper)
  pages/        auth/, dashboard/, organizations/, projects/, tasks/, profile/
  provider/     QueryClientProvider wrapper
  store/        Zustand stores (auth.store.ts – persisted as "auth-storage")
  test/         Vitest setup, MSW handlers, renderWithProviders utility
  types/        Domain types (User, Org, Project, Task, ApiResponse)
```

### Key wiring
- **Auth**: Token in `localStorage("token")`. Axios request interceptor reads it directly (NOT from zustand). Response interceptor clears session on 401 and redirects to `/login`.
- **Zustand persist key**: `"auth-storage"` (stores user + token + isAuthenticated).
- **Env**: `VITE_API_URL=http://localhost:8080/api/v1` in `.env.local`.
- **Path alias**: `@/` → `src/`.

## Testing

- **Vitest** configured **inline in `vite.config.ts`** (not a separate file).
- **MSW v2** mocks every API endpoint. Handlers in `src/test/mocks/handlers.ts` with fixtures (`mockUser`, `mockToken`, `mockOrg`, `mockProject`, `mockTask`). Base URL: `http://localhost:8080/api/v1`.
- **Setup** (`src/test/setup.ts`): auto-imports jest-dom matchers, starts/stops MSW server per suite, mocks `window.matchMedia` and sonner toasts.
- **`renderWithProviders`** (`src/test/test-utils.tsx`): wraps in `QueryClientProvider` + `MemoryRouter`. Use this for any component using React Query or React Router.
- **`createTestQueryClient()`**: creates a fresh QueryClient with `retry: false`, `staleTime: 0`, `gcTime: 0` – use in tests to avoid cache leakage.
- Coverage excludes: `src/main.tsx`, `src/test/`, `src/components/ui/`, `src/**/*.d.ts`.

## Conventions
- Use `cn()` from `@/lib/utils` (clsx + tailwind-merge) for className composition.
- TypeScript: `verbatimModuleSyntax`, `erasableSyntaxOnly`, `noUnusedLocals`, `noUnusedParameters`. Use `import type` for type-only imports.
- Route structure: public routes in `<AuthLayout>` (login/register), protected in `<AppLayout>` (sidebar + scrollable content).
