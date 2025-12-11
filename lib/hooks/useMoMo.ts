import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { momoConfigApi, momoPaymentApi } from '@/lib/api-client';
import { toast } from 'sonner';

interface AxiosError {
  response?: {
    data?: {
      detail?: string;
      error?: string;
      message?: string;
    };
  };
}

export interface MoMoConfig {
  enabled: boolean;
  provider: 'mtn' | 'vodafone' | 'airteltigo' | null;
  merchant_id: string | null;
  sandbox: boolean;
  has_credentials: boolean;
}

export interface MoMoConfigData {
  merchant_id: string;
  api_key: string;
  provider: 'mtn' | 'vodafone' | 'airteltigo';
  sandbox: boolean;
  country_code?: string;
}

export interface MoMoPayment {
  id: number;
  customer_id: number;
  customer_email: string;
  subscription_id: number | null;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed';
  provider: string;
  provider_payment_id: string;
  platform_fee: number;
  tenant_net_amount: number;
  failure_code: string | null;
  failure_message: string | null;
  retry_count: number;
  created_at: string;
  updated_at: string;
}

export interface MoMoPaymentInitResponse {
  success: boolean;
  payment_id: number;
  reference_id: string;
  external_reference: string;
  amount: number;
  currency: string;
  phone: string;
  status: string;
  instructions: string;
  provider: string;
  plan_name: string;
}

export interface MoMoPaymentStatusResponse {
  success: boolean;
  payment_id: number;
  status: 'pending' | 'succeeded' | 'failed';
  momo_status?: string;
  transaction_id: string | null;
  amount: number;
  currency: string;
  updated_at: string;
  failure_code: string | null;
  failure_message: string | null;
}

export interface MoMoTestResponse {
  success: boolean;
  message: string;
  balance?: string;
  currency?: string;
  provider: string;
  sandbox: boolean;
}

// Get MoMo configuration
export function useMoMoConfig() {
  return useQuery<MoMoConfig>({
    queryKey: ['momo-config'],
    queryFn: async () => {
      const response = await momoConfigApi.get();
      return response.data;
    },
  });
}

// Configure MoMo
export function useConfigureMoMo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: MoMoConfigData) => {
      const response = await momoConfigApi.configure(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['momo-config'] });
      toast.success('Mobile Money configured successfully');
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosError;
      toast.error(axiosError.response?.data?.message || 'Failed to configure Mobile Money');
    },
  });
}

// Disable MoMo
export function useDisableMoMo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await momoConfigApi.disable();
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['momo-config'] });
      toast.success('Mobile Money disabled successfully');
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosError;
      toast.error(axiosError.response?.data?.message || 'Failed to disable Mobile Money');
    },
  });
}

// Test MoMo connection
export function useTestMoMo() {
  return useMutation({
    mutationFn: async () => {
      const response = await momoConfigApi.test();
      return response.data as MoMoTestResponse;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`Connection successful! Balance: ${data.balance} ${data.currency}`);
      } else {
        toast.error('Connection test failed');
      }
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosError;
      toast.error(axiosError.response?.data?.message || 'Failed to test connection');
    },
  });
}

// Initiate MoMo payment
export function useInitiateMoMoPayment() {
  return useMutation({
    mutationFn: async (data: {
      customer_id: number;
      plan_id: number;
      phone_number: string;
      currency?: string;
    }) => {
      const response = await momoPaymentApi.initiate(data);
      return response.data as MoMoPaymentInitResponse;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Payment initiated! Check your phone.');
      }
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosError;
      toast.error(axiosError.response?.data?.message || 'Failed to initiate payment');
    },
  });
}

// Check MoMo payment status
export function useMoMoPaymentStatus(paymentId: number | null, options?: { 
  enabled?: boolean;
  refetchInterval?: number;
}) {
  return useQuery<MoMoPaymentStatusResponse>({
    queryKey: ['momo-payment-status', paymentId],
    queryFn: async () => {
      if (!paymentId) throw new Error('Payment ID required');
      const response = await momoPaymentApi.checkStatus(paymentId);
      return response.data;
    },
    enabled: !!paymentId && (options?.enabled !== false),
    refetchInterval: options?.refetchInterval,
  });
}

// List MoMo payments
export function useMoMoPayments(filters?: {
  status?: 'pending' | 'succeeded' | 'failed';
  customer_id?: number;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ['momo-payments', filters],
    queryFn: async () => {
      const response = await momoPaymentApi.list(filters);
      return response.data as {
        count: number;
        limit: number;
        offset: number;
        results: MoMoPayment[];
      };
    },
  });
}
