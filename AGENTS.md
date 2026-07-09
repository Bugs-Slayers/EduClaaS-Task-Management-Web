# TaskFlow Web — Agent Guide

## Commands
- `pnpm dev` — dev server at `localhost:5173`
- `pnpm build` — `tsc -b && vite build` (typecheck first, then bundle)
- `pnpm lint` — `eslint .`
- `pnpm preview` — preview production build

No test framework installed. Testing is manual only.

## Toolchain quirks
- **Vite 8**, React 19, **Tailwind v4** (`@import "tailwindcss"` in CSS, no `tailwind.config.js`), TypeScript ~6.0
- **pnpm** only — never use npm/yarn
- React Compiler enabled via babel plugin — avoid unnecessary `useMemo`/`useCallback`; the compiler handles it
- `tsconfig.json` uses project references: `tsconfig.app.json` (app) + `tsconfig.node.json` (config)
- Path alias `@/` → `src/` (configured in both `vite.config.ts` and `tsconfig.json`)
- `verbatimModuleSyntax: true` → use `import type` for type-only imports
- `erasableSyntaxOnly: true` → no enums, no namespaces, no parameter properties
- `noUnusedLocals: true`, `noUnusedParameters: true`

## Architecture
- Single-page React app (no SSR). Entry: `src/main.tsx` → `src/App.tsx`
- Routing: React Router v7 in `App.tsx` — public routes (`/login`, `/register`), protected routes (wrapped in `<AppLayout />`), invitation accept (`/invitations/accept`)
- Server state: `@tanstack/react-query` v4 via `src/provider/query-provider.tsx` (staleTime 5min, retry 1, no refetch on window focus)
- Client state: Zustand with `persist` middleware in `src/store/auth.store.ts` (stores JWT token + user, persists to localStorage under key `auth-storage`)
- Axios instance `src/lib/axios.ts` with interceptor injecting `Bearer` token from `localStorage("token")` and redirecting to `/login` on 401
- Auth: token stored in **two** localStorage keys (`token` by setAuth, `auth-storage` by Zustand persist)

## Backend dependency
- Go API at `VITE_API_URL=http://localhost:8080/api/v1` (`src/lib/axios.ts` line 4)
- Backend repo at `/Users/zelda/Documents/EduClaaS/UOR/FINAL_PROJECT/task-management`, started via `make docker-run`

## Conventions
- UI: shadcn/ui components in `src/components/ui/`, imported from `@/components/ui/<name>`
- Icons: `lucide-react` (import directly from `lucide-react`)
- Forms: React Hook Form + Zod, see existing dialogs for patterns
- Custom hooks in `src/hooks/` wrap React Query calls — prefer them over direct API calls
- API functions in `src/api/` use the shared Axios instance
- Types in `src/types/index.ts`
