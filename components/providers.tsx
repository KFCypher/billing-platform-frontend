'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { StoreProvider } from '@/lib/store/StoreProvider';
import { ThemeProvider } from '@/components/theme-provider';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <StoreProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </StoreProvider>
    </ThemeProvider>
  );
}
