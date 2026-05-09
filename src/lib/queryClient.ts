import { QueryClient } from '@tanstack/react-query';

/**
 * Shared QueryClient instance.
 * - staleTime: 2 min  — data is fresh for 2 min, no background refetch within that window
 * - gcTime:    5 min  — unused cache entries are garbage-collected after 5 min
 * - retry:     1      — retry failed requests once before showing an error
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false, // avoid surprising refetches when user alt-tabs
    },
  },
});

/** Query key factory — centralised so typos don't cause cache misses */
export const queryKeys = {
  menuItems:  () => ['menu_items'] as const,
  orders:     (userId: string) => ['orders', userId] as const,
  order:      (orderId: string) => ['order', orderId] as const,
  profile:    (userId: string) => ['profile', userId] as const,
} as const;
