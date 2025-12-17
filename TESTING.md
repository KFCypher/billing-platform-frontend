# Frontend Testing Guide

## Overview

This frontend uses **Jest** and **React Testing Library** for comprehensive testing of components, utilities, and API integrations.

## Test Structure

```
__tests__/
├── dashboard.test.tsx              # Dashboard page tests
├── components/
│   ├── pricing-widget.test.tsx     # Pricing widget component
│   └── checkout-flow.test.tsx      # Checkout flow component
└── lib/
    ├── currency.test.ts            # Currency utilities
    ├── validation.test.ts          # Validation helpers
    └── api/
        └── plans.test.ts           # Plans API client
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run specific test file
```bash
npm test dashboard.test
```

### Run tests matching pattern
```bash
npm test -- --testNamePattern="validates email"
```

## Test Coverage

### Current Coverage

| Category | Tests | Coverage |
|----------|-------|----------|
| **Dashboard Page** | 3 tests | Loading, metrics display, currency formatting |
| **Pricing Widget** | 6 tests | Plan display, pricing, features, interactions |
| **Checkout Flow** | 5 tests | Form validation, customer creation, payments |
| **Currency Utils** | 9 tests | GHS formatting, conversions, edge cases |
| **Validation Utils** | 12 tests | Email, phone, fee calculations |
| **API Client** | 8 tests | Plans fetch, checkout, subscription verification |

**Total: 43 tests covering critical user flows**

## What's Tested

### ✅ Core Features
1. **Dashboard Analytics**
   - MRR display with GHS currency
   - Active customer counts
   - Loading and error states

2. **Pricing Widget**
   - Plan rendering with correct prices
   - Currency symbol display (GH₵)
   - Trial period information
   - Feature lists
   - Plan selection interactions

3. **Checkout Flow**
   - Customer information form
   - Email validation
   - Customer creation
   - Payment method selection
   - Loading states

4. **Currency Handling**
   - GHS to pesewas conversion
   - Pesewas to GHS conversion
   - Currency formatting with symbols
   - Large amount handling

5. **Validation**
   - Email format validation
   - Phone number validation (Ghana format)
   - Platform fee calculation (15% + 50¢)

6. **API Integration**
   - Plans API with authentication
   - Checkout session creation
   - Subscription verification
   - Error handling

## Writing New Tests

### Component Test Template
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import YourComponent from '@/components/YourComponent'

describe('YourComponent', () => {
  const queryClient = new QueryClient()
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )

  it('renders correctly', () => {
    render(<YourComponent />, { wrapper })
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
})
```

### Utility Test Template
```typescript
import { yourUtilityFunction } from '@/lib/utils/yourUtil'

describe('yourUtilityFunction', () => {
  it('handles normal case', () => {
    expect(yourUtilityFunction(input)).toBe(expectedOutput)
  })

  it('handles edge cases', () => {
    expect(yourUtilityFunction(0)).toBe(0)
    expect(yourUtilityFunction(null)).toThrow()
  })
})
```

## Mocking

### Mocking API Calls
```typescript
global.fetch = jest.fn()

;(global.fetch as jest.Mock).mockResolvedValueOnce({
  ok: true,
  json: async () => ({ data: 'mock data' }),
})
```

### Mocking React Query
```typescript
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn(),
}))

const mockedUseQuery = useQuery as jest.MockedFunction<typeof useQuery>
mockedUseQuery.mockReturnValue({
  data: mockData,
  isLoading: false,
  error: null,
} as any)
```

### Mocking Next.js Router
Already configured in `jest.setup.js`:
```typescript
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
    }
  },
}))
```

## Best Practices

1. **Test User Behavior**: Focus on what users see and do, not implementation details
2. **Use Semantic Queries**: Prefer `getByRole`, `getByLabelText` over `getByTestId`
3. **Wait for Async**: Use `waitFor` for asynchronous operations
4. **Mock External Dependencies**: API calls, router navigation, etc.
5. **Test Edge Cases**: Empty states, errors, loading states
6. **Keep Tests Isolated**: Each test should be independent

## Common Patterns

### Testing Form Submission
```typescript
fireEvent.change(screen.getByLabelText(/Email/i), {
  target: { value: 'test@example.com' },
})
fireEvent.click(screen.getByText(/Submit/i))

await waitFor(() => {
  expect(mockSubmit).toHaveBeenCalled()
})
```

### Testing Loading States
```typescript
mockedUseQuery.mockReturnValue({
  data: null,
  isLoading: true,
  error: null,
} as any)

render(<Component />)
expect(screen.getByText(/Loading/i)).toBeInTheDocument()
```

### Testing Error Handling
```typescript
mockedUseQuery.mockReturnValue({
  data: null,
  isLoading: false,
  error: new Error('API Error'),
} as any)

render(<Component />)
expect(screen.getByText(/Error/i)).toBeInTheDocument()
```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Frontend Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v3
```

## Troubleshooting

### Tests timing out
Increase timeout in specific tests:
```typescript
it('slow test', async () => {
  // test code
}, 10000) // 10 second timeout
```

### Mock not working
Clear mocks between tests:
```typescript
beforeEach(() => {
  jest.clearAllMocks()
})
```

### Component not rendering
Check if all required providers are wrapped:
```typescript
const AllProviders = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      {children}
    </ThemeProvider>
  </QueryClientProvider>
)
```

## Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

## Next Steps

1. Add E2E tests with Playwright/Cypress
2. Add visual regression testing
3. Add accessibility testing
4. Increase coverage to 90%+
5. Add performance testing

---

**Last Updated**: December 16, 2025
**Test Framework**: Jest 29 + React Testing Library
**Node Version**: 18+
