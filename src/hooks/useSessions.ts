import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

export const useSessions = (limit = 50) =>
  useQuery({
    queryKey: ['sessions', limit],
    queryFn: () => api.sessions(limit),
  });

export const useSessionTurns = (sessionId: string | null) =>
  useQuery({
    queryKey: ['sessions', sessionId, 'turns'],
    queryFn: () => api.sessionTurns(sessionId!),
    enabled: !!sessionId,
  });

export const useDeleteSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => api.deleteSession(sessionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sessions'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
};
