// API Response Types
export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

// Authentication Types
export interface Tenant {
  id: number;
  company_name: string;
  email: string;
  slug: string;
  subscription_tier: 'free' | 'starter' | 'pro' | 'enterprise';
  is_active: boolean;
  stripe_connect_account_id: string | null;
  webhook_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface TenantUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'owner' | 'admin' | 'developer' | 'billing';
  tenant: Tenant;
  is_active: boolean;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  company_name: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface AuthResponse {
  message: string;
  tenant: Tenant;
  user: TenantUser;
  tokens: {
    access: string;
    refresh: string;
  };
  api_keys?: {
    live_key: string;
    test_key: string;
  };
}

// API Key Types
export interface APIKey {
  id: number;
  key_type: 'live' | 'test';
  last_4: string;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
}

// Plan Types
export interface Plan {
  id: number;
  tenant: number;
  name: string;
  description: string;
  price_cents: number;
  price?: number; // For display (in major currency unit)
  currency: string;
  currency_symbol?: string; // Currency symbol (e.g., GH₵, $, €)
  billing_interval: 'month' | 'year';
  billing_period?: 'month' | 'year'; // Alternative format
  trial_days: number;
  trial_period_days?: number; // Alternative format
  stripe_product_id: string;
  stripe_price_id: string;
  features_json: string[] | Record<string, unknown>;
  features?: string[]; // Frontend-friendly features list
  metadata_json: Record<string, unknown>;
  is_active: boolean;
  is_visible: boolean;
  is_featured?: boolean; // For featured plans
  price_display: string;
  has_trial: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePlanRequest {
  name: string;
  description?: string;
  price_cents: number;
  currency: string;
  billing_interval: 'month' | 'year';
  trial_days?: number;
  features_json?: string[];
  metadata_json?: Record<string, unknown>;
  is_visible?: boolean;
}

export interface UpdatePlanRequest {
  name?: string;
  description?: string;
  features_json?: string[];
  metadata_json?: Record<string, unknown>;
  is_visible?: boolean;
  trial_days?: number;
}

export interface DuplicatePlanRequest {
  name: string;
  description?: string;
  price_cents: number;
}

// Customer Types
export interface Customer {
  id: number;
  tenant: number;
  email: string;
  name: string;
  stripe_customer_id: string;
  phone: string | null;
  metadata: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Subscription Types
export interface Subscription {
  id: number;
  customer: Customer;
  plan: Plan;
  stripe_subscription_id: string;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  trial_end: string | null;
  created_at: string;
  updated_at: string;
}

// Payment Types
export interface Payment {
  id: number;
  subscription: number;
  stripe_payment_intent_id: string;
  amount_cents: number;
  currency: string;
  status: 'succeeded' | 'pending' | 'failed' | 'refunded';
  payment_method: string;
  created_at: string;
}

// Webhook Types
export interface WebhookEvent {
  id: number;
  event_type: string;
  stripe_event_id: string;
  payload: Record<string, unknown>;
  status: 'pending' | 'processing' | 'succeeded' | 'failed';
  attempts: number;
  last_error: string | null;
  created_at: string;
  processed_at: string | null;
}

// Analytics Types
export interface MetricData {
  label: string;
  value: number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
}

export interface ChartData {
  date: string;
  value: number;
  [key: string]: unknown;
}

export interface KPIMetrics {
  mrr: MetricData;
  active_subscribers: MetricData;
  churn_rate: MetricData;
  failed_payments: MetricData;
}

// Stripe Connect Types
export interface StripeConnectStatus {
  is_connected: boolean;
  account_id: string | null;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
}

// Pagination Types
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Filter & Sort Types
export interface FilterOptions {
  search?: string;
  is_active?: boolean;
  billing_interval?: 'month' | 'year';
  status?: string;
  date_from?: string;
  date_to?: string;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// Mobile Money Payment Types
export interface MoMoPaymentInitResponse {
  transaction_id: string;
  payment_id: number;
  status: 'pending' | 'initiated';
  message?: string;
}

export interface MoMoPaymentStatusResponse {
  status: 'pending' | 'succeeded' | 'failed' | 'expired';
  transaction_id: string;
  payment_id: number;
  error?: string;
}
