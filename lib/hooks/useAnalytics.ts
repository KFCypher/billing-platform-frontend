import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/api-client';

export function useAnalyticsOverview(dateRange?: { start_date?: string; end_date?: string }) {
  return useQuery({
    queryKey: ['analytics', 'overview', dateRange],
    queryFn: () => analyticsApi.getOverview(dateRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRevenueAnalytics(dateRange?: { start_date?: string; end_date?: string }) {
  return useQuery({
    queryKey: ['analytics', 'revenue', dateRange],
    queryFn: () => analyticsApi.getRevenue(dateRange),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCustomerAnalytics(dateRange?: { start_date?: string; end_date?: string }) {
  return useQuery({
    queryKey: ['analytics', 'customers', dateRange],
    queryFn: () => analyticsApi.getCustomers(dateRange),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePaymentAnalytics(dateRange?: { start_date?: string; end_date?: string }) {
  return useQuery({
    queryKey: ['analytics', 'payments', dateRange],
    queryFn: () => analyticsApi.getPayments(dateRange),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePlanAnalytics(dateRange?: { start_date?: string; end_date?: string }) {
  return useQuery({
    queryKey: ['analytics', 'plans', dateRange],
    queryFn: () => analyticsApi.getPlans(dateRange),
    staleTime: 5 * 60 * 1000,
  });
}
