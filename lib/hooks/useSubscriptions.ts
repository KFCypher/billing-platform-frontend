import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionApi } from '@/lib/api-client';
import { toast } from 'sonner';

export interface SubscriptionCustomer {
  id: number;
  email: string;
  full_name: string | null;
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  price_cents: number;
  currency: string;
  billing_interval: string;
}

export interface Subscription {
  id: number;
  customer: SubscriptionCustomer;
  plan: SubscriptionPlan;
  stripe_subscription_id: string;
  stripe_checkout_session_id: string | null;
  status: 'incomplete' | 'incomplete_expired' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid';
  current_period_start: string | null;
  current_period_end: string | null;
  trial_start: string | null;
  trial_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  cancellation_reason: string | null;
  quantity: number;
  metadata_json: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  platform_fee_cents: number;
}

export interface SubscriptionListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Subscription[];
}

export interface CreateSubscriptionData {
  plan_id: number;
  customer_id?: number;
  customer_email?: string;
  trial_days?: number;
  success_url: string;
  cancel_url: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateSubscriptionData {
  plan_id?: number;
  quantity?: number;
  metadata?: Record<string, unknown>;
}

export interface CancelSubscriptionData {
  immediate?: boolean;
  reason?: string;
}

// Fetch subscriptions list
export function useSubscriptions(filters?: {
  status?: string;
  plan_id?: number;
  customer_id?: number;
  page?: number;
  page_size?: number;
}) {
  return useQuery({
    queryKey: ['subscriptions', filters],
    queryFn: async () => {
      const response = await subscriptionApi.list(filters);
      return response.data as SubscriptionListResponse;
    },
  });
}

// Fetch single subscription
export function useSubscription(id: number | null) {
  return useQuery({
    queryKey: ['subscription', id],
    queryFn: async () => {
      if (!id) throw new Error('Subscription ID is required');
      const response = await subscriptionApi.get(id);
      return response.data as Subscription;
    },
    enabled: !!id,
  });
}

// Create subscription (returns Checkout URL)
export function useCreateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSubscriptionData) => {
      const response = await subscriptionApi.create(data);
      return response.data as { checkout_url: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success('Checkout session created');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create subscription');
    },
  });
}

// Update subscription
export function useUpdateSubscription(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateSubscriptionData) => {
      const response = await subscriptionApi.update(id, data);
      return response.data as Subscription;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscription', id] });
      toast.success('Subscription updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update subscription');
    },
  });
}

// Cancel subscription
export function useCancelSubscription(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CancelSubscriptionData) => {
      const response = await subscriptionApi.cancel(id, data);
      return response.data as Subscription;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscription', id] });
      toast.success('Subscription cancelled successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to cancel subscription');
    },
  });
}

// Reactivate subscription
export function useReactivateSubscription(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await subscriptionApi.reactivate(id);
      return response.data as Subscription;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscription', id] });
      toast.success('Subscription reactivated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to reactivate subscription');
    },
  });
}
