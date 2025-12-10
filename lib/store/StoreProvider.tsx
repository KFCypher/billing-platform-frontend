'use client';

import { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { initializeAuth } from './slices/authSlice';
import { initializeTenant } from './slices/tenantSlice';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      // Initialize auth and tenant state from localStorage
      store.dispatch(initializeAuth());
      store.dispatch(initializeTenant());
      initialized.current = true;
    }
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
