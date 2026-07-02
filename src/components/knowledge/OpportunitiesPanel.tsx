import { useOpportunities, useOpportunityAction } from '../../hooks/useOpportunities';
import { useJobsStore } from '../../store/jobsStore';
import { api } from '../../api/client';

/** Proactive recommendations from the Opportunity Agent: list + synthesize + curate. */
export function OpportunitiesPanel() {
  const { data: opps, isLoading, refetch } = useOpportunities();
  const action = useOpportunityAction();
  const trackJob = useJobsStore((s) => s.trackJob);

  const synthesize = async () => {
    const { job_id } = await api.synthesizeOpportunities();
    trackJob(job_id);
    // Give the job a moment, then refetch (the job stream also invalidates caches).
    setTimeout(() => refetch(), 1500);
  };

  return (
    <div className="rounded border border-neutral-800 bg-neutral-900 p-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-mono text-xs uppercase text-neutral-400">Opportunities</h3>
        <button
          onClick={synthesize}
          className="rounded border border-neutral-700 px-2 py-0.5 text-xs text-neutral-300 hover:bg-neutral-800"
        >
          ↻ synthesize
        </button>
      </div>

      {isLoading && <p className="text-sm text-neutral-500">Loading…</p>}
      {!isLoading && (!opps || opps.length === 0) && (
        <p className="text-sm text-neutral-500">
          No opportunities yet — press synthesize once you have some interests and research.
        </p>
      )}

      <ul className="space-y-2">
        {opps?.map((o) => (
          <li key={o.id} className="rounded border border-neutral-800 bg-neutral-950 p-2">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm text-stone-50">{o.title}</p>
              <span className="shrink-0 font-mono text-xs text-emerald-400">
                {Math.round((o.relevance_score ?? 0) * 100)}%
              </span>
            </div>
            {o.description && <p className="mt-1 text-xs text-neutral-300">{o.description}</p>}
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => action.mutate({ id: o.id, action: 'save' })}
                className={`rounded px-2 py-0.5 text-xs ${
                  o.status === 'saved'
                    ? 'bg-emerald-700 text-stone-50'
                    : 'border border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                ★ save
              </button>
              <button
                onClick={() => action.mutate({ id: o.id, action: 'dismiss' })}
                className="rounded border border-neutral-700 px-2 py-0.5 text-xs text-neutral-400 hover:bg-neutral-800"
              >
                ✕ dismiss
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
