import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Dashboard from '@/app/dashboard/page'
import { useQuery } from '@tanstack/react-query'
import { useAppSelector } from '@/lib/store/hooks'

// Mock useQuery
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn(),
}))

const mockedUseQuery = useQuery as jest.MockedFunction<typeof useQuery>
const mockedUseAppSelector = useAppSelector as jest.MockedFunction<typeof useAppSelector>

describe('Dashboard Page', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock Redux store state
    mockedUseAppSelector.mockReturnValue({
      user: {
        id: 1,
        email: 'test@example.com',
        tenant_id: 1,
      },
    })
  })

  it('renders dashboard with metrics', async () => {
    // Mock successful data fetch
    mockedUseQuery.mockImplementation((options: any) => {
      if (options.queryKey[0] === 'analytics-overview') {
        return {
          data: {
            data: {
              mrr_cents: 119880,
              active_customers: 10,
              total_revenue_cents: 1198800,
              churn_rate: 2.5,
            }
          },
          isLoading: false,
          error: null,
          isSuccess: true,
        } as any
      }
      return {
        data: null,
        isLoading: false,
        error: null,
        isSuccess: true,
      } as any
    })

    render(<Dashboard />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText(/Monthly Recurring Revenue/i)).toBeInTheDocument()
    })
  })

  it('shows loading state', () => {
    mockedUseQuery.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      isSuccess: false,
    } as any)

    render(<Dashboard />, { wrapper })

    // Dashboard shows skeleton components, not "Loading" text
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('displays MRR in GHS currency', async () => {
    mockedUseQuery.mockImplementation((options: any) => {
      if (options.queryKey[0] === 'analytics-overview') {
        return {
          data: {
            data: {
              mrr_cents: 119880,
              formatted_mrr: 'GH₵1,198.80',
            }
          },
          isLoading: false,
          error: null,
          isSuccess: true,
        } as any
      }
      return { data: null, isLoading: false, error: null, isSuccess: true } as any
    })

    render(<Dashboard />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText(/GH₵/)).toBeInTheDocument()
    })
  })
})
