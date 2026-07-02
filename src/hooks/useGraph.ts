import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export const useGraph = (topic: string, depth = 2) =>
  useQuery({
    queryKey: ['graph', topic, depth],
    // Empty topic is valid: the backend returns the overall top-concepts graph.
    queryFn: () => api.subgraph(topic, depth),
    refetchInterval: 30_000,
  });

export const useCitation = (id: string | null) =>
  useQuery({
    queryKey: ['citations', id],
    queryFn: () => api.citation(id!),
    enabled: !!id,
  });

export const useResearchRuns = (topic?: string, limit = 20) =>
  useQuery({
    queryKey: ['research', 'runs', topic, limit],
    queryFn: () => api.researchRuns(topic, limit),
  });
