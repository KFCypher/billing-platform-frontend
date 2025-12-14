import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // For cookie-based auth
});

// Request interceptor - Add JWT token to requests
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Get API key from localStorage if exists
    const apiKey = typeof window !== 'undefined' ? localStorage.getItem('api_key') : null;
    if (apiKey) {
      config.headers['X-API-Key'] = apiKey;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // If 401 and not already retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
        
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/tenants/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', access);
          }

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access}`;
          }
          
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/auth/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth methods
export const authApi = {
  login: (data: { email: string; password: string }) =>
    apiClient.post('/auth/tenants/login/', data),
  
  register: (data: {
    company_name: string;
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
  }) => apiClient.post('/auth/tenants/register/', data),
  
  refreshToken: (refresh: string) =>
    apiClient.post('/auth/tenants/token/refresh/', { refresh }),
  
  getCurrentUser: () => apiClient.get('/auth/tenants/me/'),
  
  getTenantDetails: () => apiClient.get('/auth/tenants/details/'),
  
  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.post('/auth/tenants/change-password/', {
      current_password: currentPassword,
      new_password: newPassword,
    }),
};

// Stripe Connect methods
export const stripeApi = {
  getConnectUrl: () => apiClient.post('/auth/tenants/stripe/connect/'),
  
  getStatus: () => apiClient.get('/auth/tenants/stripe/status/'),
  
  disconnect: () => apiClient.delete('/auth/tenants/stripe/disconnect/'),
};

// API Key methods
export const apiKeyApi = {
  list: () => apiClient.get('/auth/tenants/api-keys/'),
  
  regenerate: (keyType: 'live' | 'test') =>
    apiClient.post('/auth/tenants/api-keys/regenerate/', { key_type: keyType }),
  
  revoke: (keyType: 'live' | 'test') =>
    apiClient.delete('/auth/tenants/api-keys/revoke/', { data: { key_type: keyType } }),
  
  verify: (apiKey: string) =>
    apiClient.post('/auth/tenants/verify/', { api_key: apiKey }),
};

// Plan methods
export const planApi = {
  list: (filters?: { is_active?: boolean; billing_interval?: string; search?: string }) =>
    apiClient.get('/auth/plans/', { params: filters }),
  
  get: (id: number) => apiClient.get(`/auth/plans/${id}/`),
  
  create: (data: {
    name: string;
    description?: string;
    price_cents: number;
    currency: string;
    billing_interval: 'month' | 'year';
    trial_days?: number;
    features_json?: string[];
    metadata_json?: Record<string, unknown>;
    is_visible?: boolean;
  }) => apiClient.post('/auth/plans/', data),
  
  update: (id: number, data: {
    name?: string;
    description?: string;
    trial_days?: number;
    features_json?: string[];
    metadata_json?: Record<string, unknown>;
    is_active?: boolean;
    is_visible?: boolean;
  }) => apiClient.patch(`/auth/plans/${id}/`, data),
  
  deactivate: (id: number) => apiClient.delete(`/auth/plans/${id}/`),
  
  duplicate: (id: number, data: {
    name: string;
    description?: string;
    price_cents: number;
  }) => apiClient.post(`/auth/plans/${id}/duplicate/`, data),
};

// Webhook methods
export const webhookApi = {
  getConfig: () => apiClient.get('/auth/tenants/webhooks/config/'),
  
  setConfig: (url: string) =>
    apiClient.post('/auth/tenants/webhooks/config/', { webhook_url: url }),
  
  deleteConfig: () => apiClient.delete('/auth/tenants/webhooks/config/'),
  
  test: (data?: { event_type?: string }) => 
    apiClient.post('/auth/tenants/webhooks/test/', data || { event_type: 'test.webhook' }),
};

// Customer methods
export const customerApi = {
  list: (filters?: {
    search?: string;
    subscription_status?: string;
    country?: string;
    has_subscription?: boolean;
    page?: number;
    page_size?: number;
  }) => apiClient.get('/auth/customers/', { params: filters }),
  
  get: (id: number) => apiClient.get(`/auth/customers/${id}/`),
  
  create: (data: {
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
  }) => apiClient.post('/auth/customers/create/', data),
  
  update: (id: number, data: {
    full_name?: string;
    phone?: string;
    country?: string;
    city?: string;
    postal_code?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    metadata_json?: Record<string, unknown>;
  }) => apiClient.post(`/auth/customers/${id}/update/`, data),
};

// Subscription methods
export const subscriptionApi = {
  list: (filters?: {
    status?: string;
    plan_id?: number;
    customer_id?: number;
    page?: number;
    page_size?: number;
  }) => apiClient.get('/auth/subscriptions/', { params: filters }),
  
  get: (id: number) => apiClient.get(`/auth/subscriptions/${id}/`),
  
  create: (data: {
    plan_id: number;
    customer_id?: number;
    customer_email?: string;
    trial_days?: number;
    success_url: string;
    cancel_url: string;
    metadata?: Record<string, unknown>;
  }) => apiClient.post('/auth/subscriptions/create/', data),
  
  update: (id: number, data: {
    plan_id?: number;
    quantity?: number;
    metadata?: Record<string, unknown>;
  }) => apiClient.post(`/auth/subscriptions/${id}/update/`, data),
  
  cancel: (id: number, data: {
    immediate?: boolean;
    reason?: string;
  }) => apiClient.post(`/auth/subscriptions/${id}/cancel/`, data),
  
  reactivate: (id: number) => apiClient.post(`/auth/subscriptions/${id}/reactivate/`),
};

// Mobile Money Configuration methods
export const momoConfigApi = {
  get: () => apiClient.get('/auth/tenants/momo/config/'),
  
  configure: (data: {
    merchant_id: string;
    api_key: string;
    provider: 'mtn' | 'vodafone' | 'airteltigo';
    sandbox: boolean;
    country_code?: string;
  }) => apiClient.post('/auth/tenants/momo/config/', data),
  
  disable: () => apiClient.delete('/auth/tenants/momo/config/'),
  
  test: () => apiClient.post('/auth/tenants/momo/test/'),
};

// Paystack Configuration methods
export const paystackConfigApi = {
  get: () => apiClient.get('/auth/tenants/paystack/config/'),
  
  configure: (data: {
    secret_key: string;
    public_key: string;
    test_mode: boolean;
  }) => apiClient.post('/auth/tenants/paystack/config/', data),
  
  disable: () => apiClient.delete('/auth/tenants/paystack/config/'),
  
  test: () => apiClient.post('/auth/tenants/paystack/test/'),
};

// Mobile Money Payment methods
export const momoPaymentApi = {
  initiate: (data: {
    customer_id: number;
    plan_id: number;
    phone_number: string;
    currency?: string;
  }) => apiClient.post('/payments/momo/initiate/', data),
  
  checkStatus: (paymentId: number) => apiClient.get(`/payments/momo/${paymentId}/status/`),
  
  list: (filters?: {
    status?: 'pending' | 'succeeded' | 'failed';
    customer_id?: number;
    limit?: number;
    offset?: number;
  }) => apiClient.get('/payments/momo/', { params: filters }),
};

// Analytics API methods
export const analyticsApi = {
  getOverview: (params?: { start_date?: string; end_date?: string }) =>
    apiClient.get('/analytics/overview/', { params }),
  
  getRevenue: (params?: { start_date?: string; end_date?: string; group_by?: string }) =>
    apiClient.get('/analytics/revenue/', { params }),
  
  getCustomers: (params?: { start_date?: string; end_date?: string }) =>
    apiClient.get('/analytics/customers/', { params }),
  
  getPayments: (params?: { start_date?: string; end_date?: string }) =>
    apiClient.get('/analytics/payments/', { params }),
  
  getPlans: (params?: { start_date?: string; end_date?: string }) =>
    apiClient.get('/analytics/plans/', { params }),
  
  exportCustomers: (params?: { start_date?: string; end_date?: string; format?: string }) =>
    apiClient.get('/analytics/exports/customers/', { params, responseType: 'blob' }),
  
  exportSubscriptions: (params?: { start_date?: string; end_date?: string; format?: string }) =>
    apiClient.get('/analytics/exports/subscriptions/', { params, responseType: 'blob' }),
  
  exportMetrics: (params?: { start_date?: string; end_date?: string; format?: string }) =>
    apiClient.get('/analytics/exports/metrics/', { params, responseType: 'blob' }),
};

// Payments API
export const paymentsApi = {
  // Mobile Money payments
  initiateMomo: (data: {
    customer_id: number;
    plan_id: number;
    phone_number: string;
    currency?: string;
  }) => apiClient.post('/payments/momo/initiate/', data),
  
  checkMomoStatus: (paymentId: number) =>
    apiClient.get(`/payments/momo/${paymentId}/status/`),
  
  listMomoPayments: (filters?: {
    status?: string;
    page?: number;
    page_size?: number;
  }) => apiClient.get('/payments/momo/', { params: filters }),
};

// Customers API  
export const customersApi = {
  getAll: (filters?: {
    search?: string;
    subscription_status?: string;
    country?: string;
    has_subscription?: boolean;
    page?: number;
    page_size?: number;
  }) => apiClient.get('/auth/customers/', { params: filters }),
  
  getById: (id: string) => apiClient.get(`/auth/customers/${id}/`),
  
  create: (data: {
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
  }) => apiClient.post('/auth/customers/create/', data),
  
  update: (id: string, data: Partial<{
    full_name: string;
    phone: string;
    country: string;
    city: string;
    postal_code: string;
    metadata_json: Record<string, unknown>;
  }>) => apiClient.patch(`/auth/customers/${id}/update/`, data),
};

// Subscriptions API
export const subscriptionsApi = {
  getAll: (filters?: {
    customer?: string;
    status?: string;
    plan?: string;
    page?: number;
    page_size?: number;
  }) => apiClient.get('/auth/subscriptions/', { params: filters }),
  
  getById: (id: string) => apiClient.get(`/auth/subscriptions/${id}/`),
  
  create: (data: {
    customer_id: number;
    plan_id: number;
    trial_days?: number;
    start_date?: string;
  }) => apiClient.post('/auth/subscriptions/create/', data),
  
  update: (id: number, data: Partial<{
    plan_id: number;
    cancel_at_period_end: boolean;
  }>) => apiClient.patch(`/auth/subscriptions/${id}/update/`, data),
  
  cancel: (id: number, data?: { immediate?: boolean; reason?: string }) =>
    apiClient.post(`/auth/subscriptions/${id}/cancel/`, data),
  
  reactivate: (id: number) => apiClient.post(`/auth/subscriptions/${id}/reactivate/`),
};

// Webhooks API
export const webhooksApi = {
  getAll: (filters?: {
    status?: string;
    event_type?: string;
    page?: number;
    page_size?: number;
  }) => apiClient.get('/auth/webhooks/events/', { params: filters }),
  
  getById: (id: string) => apiClient.get(`/auth/webhooks/events/${id}/`),
  
  retry: (id: string) => apiClient.post(`/auth/webhooks/events/${id}/retry/`),
  
  getEventTypes: () => apiClient.get('/auth/webhooks/event-types/'),
  
  getStats: (params?: { start_date?: string; end_date?: string }) =>
    apiClient.get('/auth/webhooks/stats/', { params }),
  
  getConfig: () => apiClient.get('/auth/tenants/webhooks/config/'),
  
  updateConfig: (data: { url: string; secret?: string }) =>
    apiClient.post('/auth/tenants/webhooks/config/', data),
  
  deleteConfig: () => apiClient.delete('/auth/tenants/webhooks/config/'),
  
  test: (data: { event_type: string }) =>
    apiClient.post('/auth/tenants/webhooks/test/', data),
};

// Tenant settings/profile API
export const tenantApi = {
  getProfile: () => apiClient.get('/auth/tenants/me/'),
  
  getDetails: () => apiClient.get('/auth/tenants/details/'),
  
  changePassword: (data: { old_password: string; new_password: string }) =>
    apiClient.post('/auth/tenants/change-password/', data),
};

// Export the configured client
export default apiClient;
