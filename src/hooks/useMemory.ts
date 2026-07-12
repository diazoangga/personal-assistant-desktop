import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

export const useMemory = (scope?: string) =>
  useQuery({
    queryKey: ['memory', scope ?? 'all'],
    queryFn: () => api.memory(scope),
    refetchInterval: 30_000,
  });

/** Forget a memory entry, then refresh the list. */
export const useForgetMemory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.forgetMemory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['memory'] }),
  });
};
