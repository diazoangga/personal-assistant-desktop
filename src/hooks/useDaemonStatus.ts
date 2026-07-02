import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export const useDaemonStatus = () =>
  useQuery({
    queryKey: ['daemon'],
    queryFn: () => api.daemonStatus(),
    refetchInterval: 10_000,
  });
