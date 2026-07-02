import { useJobStream } from '../../hooks/useJobStream';
import { JobProgressCard } from './JobProgressCard';

export function JobStreamItem({ jobId }: { jobId: string }) {
  const state = useJobStream(jobId);
  return <JobProgressCard jobId={jobId} state={state} />;
}
