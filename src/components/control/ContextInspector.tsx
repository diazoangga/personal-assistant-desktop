import { useUIStore } from '../../store/uiStore';
import { useInterestTimeline } from '../../hooks/useInterests';
import { CitationViewer } from '../knowledge/CitationViewer';

function InterestDetail({ label }: { label: string }) {
  const { data: timeline, isLoading } = useInterestTimeline(label);

  return (
    <div>
      <p className="mb-2 font-medium text-neutral-100">{label}</p>
      {isLoading && <p className="text-xs text-neutral-600">Loading evidence…</p>}
      {!isLoading && (!timeline || timeline.length === 0) && (
        <p className="text-xs text-neutral-600">No evidence recorded yet.</p>
      )}
      <ul className="space-y-1.5">
        {timeline?.map((item) => (
          <li key={item.id} className="text-xs text-neutral-500">
            <span className="font-mono text-neutral-700">[{item.signal_type}]</span>{' '}
            <span className="text-emerald-600">{item.confidence.toFixed(2)}</span>
            {' · '}
            {new Date(item.created_at).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ContextInspector() {
  const selected = useUIStore((s) => s.selectedEntity);

  if (!selected) {
    return (
      <p className="text-xs text-neutral-600 leading-relaxed">
        Select a concept node or interest pill to view its evidence trail.
      </p>
    );
  }

  if (selected.type === 'interest') return <InterestDetail label={selected.label} />;

  if (selected.type === 'node' && selected.category === 'paper') {
    return <CitationViewer citationId={selected.id} />;
  }

  return (
    <div>
      <p className="font-medium text-neutral-100">{selected.label}</p>
      <p className="mt-0.5 text-[10px] uppercase tracking-widest text-neutral-600">{selected.category}</p>
    </div>
  );
}
