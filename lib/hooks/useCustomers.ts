import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerApi } from '@/lib/api-client';
import { toast } from 'sonner';

export interface Customer {
  id: number;
  email: string;
  full_name: string | null;
  phone: string | null;
  stripe_customer_id: string;
  country: string | null;
  city: string | null;
  postal_code: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  metadata_json: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Customer[];
}

export interface CreateCustomerData {
  email: string;
  full_name?: string;
  phone?: string;
  country?: string;
  city?: string;
  postal_code?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  metadata_json?: Record<string, unknown>;
}

export interface UpdateCustomerData {
  full_name?: string;
  phone?: string;
  country?: string;
  city?: string;
  postal_code?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  metadata_json?: Record<string, unknown>;
}

// Fetch customers list
export function useCustomers(filters?: {
  search?: string;
  subscription_status?: string;
  country?: string;
  has_subscription?: boolean;
  page?: number;
  page_size?: number;
}) {
  return useQuery({
    queryKey: ['customers', filters],
    queryFn: async () => {
      const response = await customerApi.list(filters);
      return response.data as CustomerListResponse;
    },
  });
}

// Fetch single customer
export function useCustomer(id: number | null) {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      if (!id) throw new Error('Customer ID is required');
      const response = await customerApi.get(id);
      return response.data as Customer;
    },
    enabled: !!id,
  });
}

// Create customer
export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCustomerData) => {
      const response = await customerApi.create(data);
      return response.data as Customer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create customer');
    },
  });
}

// Update customer
export function useUpdateCustomer(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateCustomerData) => {
      const response = await customerApi.update(id, data);
      return response.data as Customer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', id] });
      toast.success('Customer updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update customer');
    },
  });
}
