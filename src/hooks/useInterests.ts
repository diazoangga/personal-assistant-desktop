import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export const useInterests = (minStrength = 0.0) =>
  useQuery({
    queryKey: ['interests', minStrength],
    queryFn: () => api.interests(minStrength),
    refetchInterval: 30_000,
  });

export const useInterestTimeline = (label: string | null, limit = 50) =>
  useQuery({
    queryKey: ['interests', label, 'timeline', limit],
    queryFn: () => api.interestTimeline(label!, limit),
    enabled: !!label,
  });
