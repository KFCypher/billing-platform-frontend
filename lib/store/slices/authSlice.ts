import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  tenant_id: number;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user: User;
        accessToken: string;
        refreshToken: string;
      }>
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.isLoading = false;

      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', action.payload.accessToken);
        localStorage.setItem('refresh_token', action.payload.refreshToken);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      }
    },
    updateTokens: (
      state,
      action: PayloadAction<{ accessToken: string; refreshToken?: string }>
    ) => {
      state.accessToken = action.payload.accessToken;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }

      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', action.payload.accessToken);
        if (action.payload.refreshToken) {
          localStorage.setItem('refresh_token', action.payload.refreshToken);
        }
      }
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        
        // Persist to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      }
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;

      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        localStorage.removeItem('tenant');
      }
    },
    initializeAuth: (state) => {
      // Load from localStorage on app start
      if (typeof window !== 'undefined') {
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');
        const userData = localStorage.getItem('user');

        if (accessToken && refreshToken && userData) {
          try {
            state.user = JSON.parse(userData);
            state.accessToken = accessToken;
            state.refreshToken = refreshToken;
            state.isAuthenticated = true;
          } catch (e) {
            console.error('Failed to parse stored user data:', e);
          }
        }
      }
      state.isLoading = false;
    },
  },
});

export const {
  setCredentials,
  updateTokens,
  updateUser,
  logout,
  initializeAuth,
} = authSlice.actions;

export default authSlice.reducer;
