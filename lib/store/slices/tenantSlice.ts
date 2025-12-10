import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Tenant {
  id: number;
  company_name: string;
  email: string;
  slug: string;
  stripe_connect_account_id?: string;
  stripe_connect_status: string;
  webhook_url?: string;
  api_key_public?: string;
  api_key_test_public?: string;
}

interface TenantState {
  tenant: Tenant | null;
  isLoading: boolean;
}

const initialState: TenantState = {
  tenant: null,
  isLoading: true,
};

const tenantSlice = createSlice({
  name: 'tenant',
  initialState,
  reducers: {
    setTenant: (state, action: PayloadAction<Tenant>) => {
      state.tenant = action.payload;
      state.isLoading = false;

      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('tenant', JSON.stringify(action.payload));
      }
    },
    updateTenant: (state, action: PayloadAction<Partial<Tenant>>) => {
      if (state.tenant) {
        state.tenant = { ...state.tenant, ...action.payload };
        
        // Persist to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('tenant', JSON.stringify(state.tenant));
        }
      }
    },
    clearTenant: (state) => {
      state.tenant = null;
      state.isLoading = false;

      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('tenant');
      }
    },
    initializeTenant: (state) => {
      // Load from localStorage on app start
      if (typeof window !== 'undefined') {
        const tenantData = localStorage.getItem('tenant');

        if (tenantData) {
          try {
            state.tenant = JSON.parse(tenantData);
          } catch (e) {
            console.error('Failed to parse stored tenant data:', e);
          }
        }
      }
      state.isLoading = false;
    },
  },
});

export const { setTenant, updateTenant, clearTenant, initializeTenant } =
  tenantSlice.actions;

export default tenantSlice.reducer;
