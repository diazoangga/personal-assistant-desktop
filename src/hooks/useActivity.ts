import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export const useActivity = (limit = 50) =>
  useQuery({
    queryKey: ['activity', limit],
    queryFn: () => api.activity(limit),
    refetchInterval: 15_000,
  });
