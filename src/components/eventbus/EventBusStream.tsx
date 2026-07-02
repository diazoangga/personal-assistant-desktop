import { useJobsStore } from '../../store/jobsStore';
import { JobStreamItem } from './JobStreamItem';

// Pinned to the top of the canvas — every command (manual or, once the
// backend supports pushing daemon-triggered job ids, autonomous) appears
// here as the same Started→Progress→Result stream (docs/UI_DESIGN.md §4).
export function EventBusStream() {
  const jobIds = useJobsStore((s) => s.jobIds);

  if (jobIds.length === 0) {
    return (
      <div className="rounded border border-neutral-800 bg-neutral-900 p-3 font-mono text-sm text-neutral-600">
        No active jobs. Launch Manual Research or ask a question to see live progress here.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {jobIds.map((jobId) => (
        <JobStreamItem key={jobId} jobId={jobId} />
      ))}
    </div>
  );
}
