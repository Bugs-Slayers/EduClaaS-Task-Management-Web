# Testing Guide - EduClaaS Task Management Frontend

## Overview

This document provides comprehensive information about the testing infrastructure for the EduClaaS Task Management frontend application built with React 19, TypeScript, Vite, and Vitest.

## Test Structure

```
EduClaaS-Task-Management-Web/
├── src/
│   ├── api/__tests__/              # API layer tests
│   │   ├── auth.api.test.ts
│   │   ├── organizations.api.test.ts
│   │   ├── projects.api.test.ts
│   │   └── tasks.api.test.ts
│   ├── hooks/__tests__/            # React hooks tests
│   │   ├── useOrganizations.test.ts
│   │   ├── useProjects.test.ts
│   │   └── useTasks.test.ts
│   ├── store/__tests__/            # Zustand store tests
│   │   └── auth.store.test.ts
│   ├── lib/__tests__/              # Utility function tests
│   │   └── utils.test.ts
│   ├── types/__tests__/            # TypeScript type tests
│   │   └── types.test.ts
│   ├── components/shared/__tests__/ # Component tests
│   │   ├── StatusBadge.test.tsx
│   │   └── EmptyState.test.tsx
│   └── test/                       # Test infrastructure
│       ├── setup.ts                # Global test setup
│       ├── utils.tsx               # Test utilities
│       └── mocks/
│           ├── server.ts           # MSW server instance
│           └── handlers.ts         # API mock handlers
├── vite.config.ts                  # Vitest configuration
└── package.json                    # Test scripts
```

## Test Technologies

- **Vitest** - Fast unit test framework (Vite-native)
- **@testing-library/react** - React component testing utilities
- **@testing-library/user-event** - User interaction simulation
- **MSW (Mock Service Worker)** - API mocking
- **jsdom** - DOM implementation for Node.js

## Running Tests

### Basic Commands

```bash
# Run all tests once
pnpm test

# Run tests in watch mode (interactive)
pnpm test:watch

# Run tests with coverage report
pnpm test:coverage

# Run tests with UI (browser-based test runner)
pnpm test:ui
```

### NPM/Yarn Equivalents

```bash
# npm
npm test
npm run test:watch
npm run test:coverage
npm run test:ui

# yarn
yarn test
yarn test:watch
yarn test:coverage
yarn test:ui
```

## Test Categories

### 1. API Tests (12 tests)

**Location:** `src/api/__tests__/`

**What's Tested:**
- HTTP request/response handling
- Error handling and status codes
- Request payload formatting
- Response data parsing

**Files:**
- `auth.api.test.ts` - Login, register, profile endpoints
- `organizations.api.test.ts` - Organization CRUD operations
- `projects.api.test.ts` - Project CRUD operations
- `tasks.api.test.ts` - Task CRUD operations

### 2. Hook Tests (90+ tests)

**Location:** `src/hooks/__tests__/`

**What's Tested:**
- React Query hooks (queries and mutations)
- Query key generation
- Loading/success/error states
- Data fetching and caching
- Mutation side effects

**Files:**
- `useOrganizations.test.ts` - Organization hooks (24 tests)
- `useProjects.test.ts` - Project hooks (24 tests)
- `useTasks.test.ts` - Task hooks (30 tests)

### 3. Store Tests (10+ tests)

**Location:** `src/store/__tests__/`

**What's Tested:**
- Zustand state management
- State mutations
- Computed values
- State persistence

**Files:**
- `auth.store.test.ts` - Authentication state management

### 4. Utility Tests (5+ tests)

**Location:** `src/lib/__tests__/`

**What's Tested:**
- Helper functions
- Utility functions
- Class name merging (cn)

**Files:**
- `utils.test.ts` - Utility function tests

### 5. Type Tests (5+ tests)

**Location:** `src/types/__tests__/`

**What's Tested:**
- TypeScript type contracts
- Type guards
- Interface compliance

**Files:**
- `types.test.ts` - Type validation tests

### 6. Component Tests (10+ tests)

**Location:** `src/components/**/__tests__/`

**What's Tested:**
- Component rendering
- User interactions
- Props handling
- Accessibility

**Files:**
- `StatusBadge.test.tsx` - Status badge component
- `EmptyState.test.tsx` - Empty state component

## Test Infrastructure

### Global Setup (`src/test/setup.ts`)

Configures:
- MSW server lifecycle (beforeAll, afterEach, afterAll)
- Browser API stubs (matchMedia, etc.)
- Toast notification mocking
- DOM cleanup between tests

### Test Utilities (`src/test/utils.tsx`)

Provides:
- `createTestQueryClient()` - Fresh QueryClient for each test
- `renderWithProviders()` - Render with QueryClient + Router
- Re-exports from @testing-library/react

### API Mocking (`src/test/mocks/`)

**handlers.ts** - Mock API responses for:
- Authentication (login, register, profile)
- Organizations (CRUD, invitations, members)
- Projects (CRUD, invitations, members)
- Tasks (CRUD, assign/unassign)

**server.ts** - MSW server instance

## Test Patterns

### API Test Pattern

```typescript
import { describe, it, expect } from "vitest";
import { myApi } from "../myApi";

describe("myApi – endpoint", () => {
  it("returns data on success", async () => {
    const res = await myApi.getData();
    expect(res.data.success).toBe(true);
    expect(res.data.data).toBeDefined();
  });

  it("throws on error", async () => {
    await expect(
      myApi.getData({ invalid: true })
    ).rejects.toMatchObject({ 
      response: { status: 400 } 
    });
  });
});
```

### Hook Test Pattern

```typescript
import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTestQueryClient } from "@/test/utils";
import { useMyHook } from "../useMyHook";

function wrapper({ children }: { children: React.ReactNode }) {
  return createElement(QueryClientProvider, {
    client: createTestQueryClient(),
    children,
  });
}

describe("useMyHook", () => {
  it("fetches data successfully", async () => {
    const { result } = renderHook(() => useMyHook(), { wrapper });
    
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    
    expect(result.current.data).toBeDefined();
  });
});
```

### Component Test Pattern

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MyComponent } from "../MyComponent";

describe("MyComponent", () => {
  it("renders correctly", () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText("Test")).toBeInTheDocument();
  });

  it("handles click events", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    
    render(<MyComponent onClick={onClick} />);
    await user.click(screen.getByRole("button"));
    
    expect(onClick).toHaveBeenCalledOnce();
  });
});
```

## Coverage Configuration

Coverage is configured in `vite.config.ts`:

```typescript
coverage: {
  provider: "v8",
  reporter: ["text", "lcov", "html"],
  include: ["src/**/*.{ts,tsx}"],
  exclude: [
    "src/main.tsx",           // Entry point
    "src/test/**",            // Test infrastructure
    "src/components/ui/**",   // Third-party UI components
    "src/**/*.d.ts",          // Type definitions
  ],
}
```

### Viewing Coverage

After running `pnpm test:coverage`:
1. Open `coverage/index.html` in your browser
2. Navigate through files to see line-by-line coverage
3. Identify untested code paths

## Test Statistics

### Current Test Coverage

- **Total Tests:** 149 tests
- **Test Files:** 12 files
- **Execution Time:** ~3-4 seconds
- **All Tests:** ✅ Passing

### Test Distribution

| Category | Tests | Files |
|----------|-------|-------|
| API Tests | 12 | 4 |
| Hook Tests | 90+ | 3 |
| Store Tests | 10+ | 1 |
| Utility Tests | 5+ | 1 |
| Type Tests | 5+ | 1 |
| Component Tests | 10+ | 2 |

## Mocking Strategies

### 1. API Mocking with MSW

MSW intercepts network requests at the network level:

```typescript
// Override default handler for specific test
import { server } from "@/test/mocks/server";
import { http, HttpResponse } from "msw";

it("handles API error", async () => {
  server.use(
    http.get("/api/v1/tasks", () =>
      HttpResponse.json({ success: false }, { status: 500 })
    )
  );
  
  // Test error handling...
});
```

### 2. Module Mocking

Mock external dependencies:

```typescript
import { vi } from "vitest";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));
```

### 3. Component Mocking

Mock child components:

```typescript
vi.mock("@/components/TaskCard", () => ({
  TaskCard: ({ task }: { task: Task }) => (
    <div data-testid="task-card">{task.title}</div>
  ),
}));
```

## Best Practices

### 1. Test Organization

- ✅ Co-locate tests with source files using `__tests__` directories
- ✅ Name test files with `.test.ts` or `.test.tsx` suffix
- ✅ Group related tests with `describe` blocks
- ✅ Use descriptive test names that explain the scenario

### 2. Test Independence

- ✅ Each test should be independent
- ✅ Don't rely on test execution order
- ✅ Clean up after each test (handled by setup.ts)
- ✅ Use fresh QueryClient for each test

### 3. Async Testing

- ✅ Use `waitFor` for async state changes
- ✅ Use `await` for async operations
- ✅ Don't use arbitrary timeouts
- ✅ Test loading states explicitly

### 4. User-Centric Testing

- ✅ Query by role, label, or text (not test IDs when possible)
- ✅ Simulate real user interactions with `userEvent`
- ✅ Test accessibility (ARIA roles, labels)
- ✅ Test keyboard navigation

### 5. What to Test

✅ **Do Test:**
- User interactions and workflows
- Data fetching and mutations
- Error handling
- Loading and success states
- Conditional rendering
- Form validation

❌ **Don't Test:**
- Implementation details
- Third-party library internals
- Styles and CSS (use visual regression testing instead)
- Exact HTML structure (test behavior, not markup)

## Debugging Tests

### 1. Debug in VS Code

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Vitest Tests",
  "runtimeExecutable": "pnpm",
  "runtimeArgs": ["test", "--run"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

### 2. Debug with Browser DevTools

```bash
# Run tests with --inspect flag
pnpm test --inspect-brk

# Open chrome://inspect in Chrome
# Click "inspect" on the Node process
```

### 3. Use screen.debug()

```typescript
import { render, screen } from "@testing-library/react";

it("debugs component", () => {
  render(<MyComponent />);
  screen.debug(); // Prints DOM to console
});
```

### 4. Use logRoles()

```typescript
import { render, logRoles } from "@testing-library/react";

it("shows available roles", () => {
  const { container } = render(<MyComponent />);
  logRoles(container); // Lists all ARIA roles
});
```

## Continuous Integration

### GitHub Actions Example

```yaml
name: Frontend Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run tests
        run: pnpm test
      
      - name: Generate coverage
        run: pnpm test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

## Troubleshooting

### Tests Fail with "No test suite found"

**Problem:** Test files fail to compile/import

**Solutions:**
1. Check `tsconfig.json` has `baseUrl: "."`
2. Verify path aliases in `vite.config.ts`
3. Check for syntax errors in test files
4. Ensure all imports are correct

### MSW Handlers Not Working

**Problem:** API calls not being intercepted

**Solutions:**
1. Verify MSW server is started in `setup.ts`
2. Check handler URL matches exactly
3. Use `server.use()` to override handlers in specific tests
4. Check browser console for MSW warnings

### React Query Tests Timeout

**Problem:** Tests hang waiting for queries

**Solutions:**
1. Ensure `waitFor` is used for async operations
2. Check that QueryClient has `retry: false` in tests
3. Verify MSW handlers return responses
4. Use `await waitFor(() => expect(...).toBe(true))`

### "Not implemented: navigation" Warning

**Problem:** jsdom warning about navigation

**Solution:** This is expected and can be ignored. It's a jsdom limitation that doesn't affect tests.

## Future Test Additions

### Planned Tests

1. **Hook Tests**
   - `useAuth.test.ts` - Authentication hooks

2. **Page Tests**
   - `LoginPage.test.tsx` - Login page
   - `RegisterPage.test.tsx` - Registration page
   - `DashboardPage.test.tsx` - Dashboard page
   - `TasksPage.test.tsx` - Tasks page

3. **Form Tests**
   - `TaskFormDialog.test.tsx` - Task creation/editing
   - `ProjectFormDialog.test.tsx` - Project creation/editing
   - `OrgFormDialog.test.tsx` - Organization creation/editing

4. **Layout Tests**
   - `AppLayout.test.tsx` - Main layout
   - `Sidebar.test.tsx` - Navigation sidebar

5. **Integration Tests**
   - End-to-end user workflows
   - Multi-step form submissions
   - Navigation flows

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library React](https://testing-library.com/docs/react-testing-library/intro/)
- [MSW Documentation](https://mswjs.io/)
- [React Query Testing](https://tanstack.com/query/latest/docs/react/guides/testing)
- [Common Testing Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Contributing

When adding new features:
1. Write tests alongside feature code
2. Ensure all tests pass: `pnpm test`
3. Check coverage: `pnpm test:coverage`
4. Aim for >80% coverage on new code
5. Update this guide if adding new test patterns

## Support

For questions or issues with tests:
1. Check this guide first
2. Review Vitest documentation
3. Check Testing Library documentation
4. Review existing test files for patterns
