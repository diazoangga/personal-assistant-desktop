import { useSessionTrace } from '../../hooks/useOpportunities';
import { TraceTimeline } from '../trace/TraceTimeline';

/** Persisted per-session audit trail: the agent/tool/skill/llm span tree. */
export function SessionTrace({ sessionId }: { sessionId: string | null }) {
  const { data: trace } = useSessionTrace(sessionId);

  if (!sessionId || !trace || trace.length === 0) return null;

  return (
    <details className="rounded border border-white/[0.06] bg-white/[0.02] p-2">
      <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-widest text-neutral-500">
        Trace ({trace.length})
      </summary>
      <div className="mt-2">
        <TraceTimeline steps={trace} />
      </div>
    </details>
  );
}
