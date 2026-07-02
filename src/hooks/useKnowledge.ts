import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export const useKnowledge = (minQuality = 0.65, limit = 50) =>
  useQuery({
    queryKey: ['knowledge', minQuality, limit],
    queryFn: () => api.knowledge(minQuality, limit),
  });

export const useKnowledgeSearch = (q: string, limit = 20) =>
  useQuery({
    queryKey: ['knowledge', 'search', q, limit],
    queryFn: () => api.searchKnowledge(q, limit),
    enabled: q.length > 0,
  });
