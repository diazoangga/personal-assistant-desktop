import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export const useDigest = (date?: string) =>
  useQuery({
    queryKey: ['digest', date ?? 'today'],
    queryFn: () => api.digest(date),
    refetchInterval: 5 * 60_000,
  });
