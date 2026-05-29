import { type ReactElement } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'

/**
 * Creates a fresh QueryClient for each test so cache never leaks between tests.
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,       // fail fast in tests
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

interface WrapperOptions extends RenderOptions {
  initialEntries?: string[]
}

/**
 * Renders a component wrapped in QueryClientProvider + MemoryRouter.
 * Use this for any component that uses React Query hooks or React Router.
 */
export function renderWithProviders(
  ui: ReactElement,
  { initialEntries = ['/'], ...options }: WrapperOptions = {},
) {
  const queryClient = createTestQueryClient()

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          {children}
        </MemoryRouter>
      </QueryClientProvider>
    )
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...options }),
    queryClient,
  }
}

// Re-export everything from testing-library for convenience
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
