import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { useJobsStore } from '../store/jobsStore';

export const useWorkers = () =>
  useQuery({
    queryKey: ['workers'],
    queryFn: () => api.workers(),
    refetchInterval: 15_000,
  });

/** Trigger a worker now; tracks its job so it shows in the live activity stream. */
export const useRunWorker = () => {
  const qc = useQueryClient();
  const trackJob = useJobsStore((s) => s.trackJob);
  return useMutation({
    mutationFn: (name: string) => api.runWorker(name),
    onSuccess: ({ job_id }) => {
      trackJob(job_id);
      qc.invalidateQueries({ queryKey: ['workers'] });
    },
  });
};
