import { useSessionTrace } from '../../hooks/useOpportunities';

const KIND_COLOR: Record<string, string> = {
  agent: 'text-violet-300',
  tool: 'text-sky-300',
  skill: 'text-amber-300',
};

/** Compact per-session audit trail: which agent/tool/skill ran, in order. */
export function SessionTrace({ sessionId }: { sessionId: string | null }) {
  const { data: trace } = useSessionTrace(sessionId);

  if (!sessionId || !trace || trace.length === 0) return null;

  return (
    <details className="rounded border border-neutral-800 bg-neutral-900/60 p-2">
      <summary className="cursor-pointer font-mono text-xs uppercase text-neutral-400">
        Trace ({trace.length})
      </summary>
      <ul className="mt-2 space-y-1">
        {trace.map((t) => (
          <li key={t.id} className="flex items-center gap-2 font-mono text-xs">
            <span className={KIND_COLOR[t.kind] ?? 'text-neutral-300'}>{t.kind}</span>
            <span className="text-neutral-200">{t.name}</span>
            <span className={t.status === 'error' ? 'text-red-400' : 'text-emerald-400'}>
              {t.status === 'error' ? '✕' : '✓'}
            </span>
            {t.duration_ms != null && <span className="text-neutral-500">{t.duration_ms}ms</span>}
            {t.detail && <span className="truncate text-neutral-500">— {t.detail}</span>}
          </li>
        ))}
      </ul>
    </details>
  );
}
