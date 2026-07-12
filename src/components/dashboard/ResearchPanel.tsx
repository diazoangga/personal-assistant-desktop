import { useResearchRuns } from '../../hooks/useGraph';
import { useUIStore } from '../../store/uiStore';

/** Recent + launchable research — one of the dashboard's three hero panels. */
export function ResearchPanel() {
  const { data: runs, isLoading } = useResearchRuns();
  const openResearchLauncher = useUIStore((s) => s.openResearchLauncher);

  return (
    <div className="flex h-full flex-col rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500">Research</h3>
        <button
          onClick={openResearchLauncher}
          className="rounded border border-white/[0.08] px-2 py-0.5 text-xs text-neutral-300 hover:bg-white/[0.06]"
        >
          + Launch
        </button>
      </div>
      {isLoading && <p className="text-sm text-neutral-600">Loading…</p>}
      {!isLoading && (!runs || runs.length === 0) && (
        <p className="text-sm text-neutral-600">No research runs yet. Launch one to build the graph.</p>
      )}
      <ul className="min-h-0 flex-1 space-y-1.5 overflow-y-auto">
        {runs?.slice(0, 6).map((r) => (
          <li key={r.id} className="rounded border border-white/[0.05] bg-white/[0.02] px-2 py-1.5">
            <p className="truncate text-sm text-neutral-200">{r.topic}</p>
            <p className="font-mono text-[10px] text-neutral-500">
              {r.papers_found ?? 0} papers · {r.concepts_extracted ?? 0} concepts
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
