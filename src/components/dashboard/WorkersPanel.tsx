import { useWorkers, useRunWorker } from '../../hooks/useWorkers';

const WORKER_LABEL: Record<string, string> = {
  opportunities: 'Opportunities',
  digest: 'Daily digest',
  auto_research: 'Auto-research',
};

const ALL_WORKERS = ['opportunities', 'digest', 'auto_research'];

function statusDot(status?: string) {
  if (status === 'running') return '#4ADE9E';
  if (status === 'error') return '#FF6B6B';
  if (status === 'ok') return '#5CC8FF';
  return '#5A6473';
}

/** Background worker status + manual trigger. */
export function WorkersPanel() {
  const { data: runs } = useWorkers();
  const run = useRunWorker();
  const byWorker = new Map((runs ?? []).map((r) => [r.worker, r]));

  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
      <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
        Workers
      </h3>
      <ul className="space-y-1.5">
        {ALL_WORKERS.map((name) => {
          const r = byWorker.get(name);
          return (
            <li key={name} className="flex items-center gap-2 text-xs">
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: statusDot(r?.status) }}
              />
              <span className="text-neutral-300">{WORKER_LABEL[name] ?? name}</span>
              {r?.detail && <span className="truncate text-neutral-600">— {r.detail}</span>}
              <button
                onClick={() => run.mutate(name)}
                disabled={run.isPending}
                className="ml-auto shrink-0 rounded border border-white/[0.08] px-1.5 py-0.5 font-mono text-[10px] text-neutral-400 hover:bg-white/[0.06] disabled:opacity-40"
              >
                run
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
