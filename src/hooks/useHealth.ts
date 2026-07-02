import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

// Polled at a short, fixed interval so the OfflineScreen can detect recovery
// and the workspace can detect the backend going away (docs/ARCHITECTURE.md §5).
export const useHealth = () =>
  useQuery({
    queryKey: ['health'],
    queryFn: () => api.health(),
    refetchInterval: 5_000,
    retry: false,
  });
