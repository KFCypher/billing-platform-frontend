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
  getConnectUrl: () => apiClient.get('/auth/tenants/stripe/connect/'),
  
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
    features_json?: string[];
    metadata_json?: Record<string, unknown>;
    is_visible?: boolean;
    trial_days?: number;
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
  
  test: () => apiClient.post('/auth/tenants/webhooks/test/'),
};

// Export the configured client
export default apiClient;
