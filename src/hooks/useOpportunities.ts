import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

export const useOpportunities = (status?: string) =>
  useQuery({
    queryKey: ['opportunities', status ?? 'all'],
    queryFn: () => api.opportunities(status),
    refetchInterval: 60_000,
  });

export const useSessionTrace = (sessionId: string | null) =>
  useQuery({
    queryKey: ['sessions', sessionId, 'trace'],
    queryFn: () => api.sessionTrace(sessionId!),
    enabled: !!sessionId,
    refetchInterval: 5_000,
  });

/** Save/dismiss an opportunity, then refresh the list. */
export const useOpportunityAction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'save' | 'dismiss' }) =>
      api.updateOpportunity(id, action),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['opportunities'] }),
  });
};
