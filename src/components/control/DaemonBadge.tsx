import { useDaemonStatus } from '../../hooks/useDaemonStatus';

function timeAgo(iso: string | null): string {
  if (!iso) return 'never';
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.round(minutes / 60)}h ago`;
}

export function DaemonBadge({ compact }: { compact?: boolean }) {
  const { data } = useDaemonStatus();
  const running = data?.running ?? false;

  if (compact) {
    return (
      <div
        className="flex items-center gap-1.5 rounded px-2 py-1 text-xs font-mono"
        title={running ? `Daemon active · Last ingest: ${timeAgo(data?.last_ingest ?? null)}` : 'Daemon offline'}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${running ? 'bg-emerald-400' : 'bg-red-500'}`} />
        <span className={running ? 'text-emerald-400' : 'text-red-400'}>
          {running ? 'Active' : 'Offline'}
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-3 font-mono text-xs">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${running ? 'bg-emerald-400' : 'bg-red-500'}`} />
        <span className={running ? 'text-emerald-400' : 'text-red-400'}>
          Daemon {running ? 'Active' : 'Offline'}
        </span>
      </div>
      {running && (
        <div className="mt-1.5 text-neutral-600">
          Last ingest: {timeAgo(data?.last_ingest ?? null)}
        </div>
      )}
    </div>
  );
}
