import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import CheckoutFlow from '@/components/checkout/CheckoutFlow'
import { useMutation, useQuery } from '@tanstack/react-query'

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useMutation: jest.fn(),
  useQuery: jest.fn(),
}))

const mockedUseMutation = useMutation as jest.MockedFunction<typeof useMutation>
const mockedUseQuery = useQuery as jest.MockedFunction<typeof useQuery>

describe('CheckoutFlow Component', () => {
  const mockPlan = {
    id: 1,
    name: 'Basic Plan',
    description: 'Basic subscription',
    price_cents: 11988,
    currency: 'GHS',
    billing_interval: 'month' as const,
    trial_days: 7,
    features: ['Feature 1', 'Feature 2'],
  }

  const queryClient = new QueryClient()
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock useMutation for subscription creation and MoMo payment
    mockedUseMutation.mockReturnValue({
      mutate: jest.fn(),
      mutateAsync: jest.fn(),
      isPending: false,
      isError: false,
      error: null,
    } as any)
    
    // Mock useQuery for MoMo payment status
    mockedUseQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    } as any)
  })

  it('renders payment method selector', () => {
    render(<CheckoutFlow plan={mockPlan} customerId={1} />, { wrapper })

    expect(screen.getByText('Payment Method')).toBeInTheDocument()
    expect(screen.getByText('Card Payment')).toBeInTheDocument()
    expect(screen.getByText('Mobile Money')).toBeInTheDocument()
  })

  it('displays plan information', () => {
    render(<CheckoutFlow plan={mockPlan} customerId={1} />, { wrapper })

    expect(screen.getByText('Basic Plan')).toBeInTheDocument()
    // Component uses Intl.NumberFormat which formats as "GHS 119.88"
    expect(screen.getByText(/GHS.*119\.88/)).toBeInTheDocument()
  })

  it('calls subscription creation when Continue to Payment clicked', async () => {
    const mockMutateAsync = jest.fn().mockResolvedValue({ checkout_url: 'https://checkout.stripe.com' })
    mockedUseMutation.mockReturnValue({
      mutate: jest.fn(),
      mutateAsync: mockMutateAsync,
      isPending: false,
      isError: false,
      error: null,
    } as any)

    render(<CheckoutFlow plan={mockPlan} customerId={1} />, { wrapper })

    fireEvent.click(screen.getByText(/Continue to Payment/i))

    await waitFor(() => {
      // jsdom defaults window.location.origin to 'http://localhost'
      expect(mockMutateAsync).toHaveBeenCalledWith({
        customer_id: 1,
        plan_id: 1,
        success_url: 'http://localhost/success',
        cancel_url: 'http://localhost/checkout',
      })
    })
  })
})
