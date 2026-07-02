import type { JobStreamState } from '../../hooks/useJobStream';

interface JobProgressCardProps {
  jobId: string;
  state: JobStreamState;
}

export function JobProgressCard({ jobId, state }: JobProgressCardProps) {
  const pct = state.pct != null ? Math.round(state.pct * 100) : null;
  const statusColor = state.error ? 'text-red-400' : state.done ? 'text-emerald-400' : 'text-emerald-400';
  const statusIcon = state.error ? '🔴' : '🟢';

  return (
    <div className="rounded border border-neutral-800 bg-neutral-900 p-3 font-mono text-sm">
      <div className={`flex items-center justify-between ${statusColor}`}>
        <span>
          {statusIcon} {state.kind ?? 'job'} // Job #{jobId.slice(0, 8)}{' '}
          {state.done ? (state.error ? 'Failed' : 'Complete') : 'Active'}
        </span>
        {pct != null && <span>{pct}%</span>}
      </div>
      {pct != null && (
        <div className="mt-2 h-2 w-full overflow-hidden rounded bg-neutral-800">
          <div
            className="h-full bg-emerald-600 motion-safe:transition-[width] motion-safe:duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
      {state.message && <p className="mt-2 text-neutral-400">› {state.message}</p>}
      {state.error && <p className="mt-2 text-red-400">{state.error}</p>}
    </div>
  );
}
