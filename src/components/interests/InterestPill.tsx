import type { Interest } from '../../api/types';
import { useUIStore } from '../../store/uiStore';

// Strength → visual weight buckets (docs/UI_DESIGN.md §2). The ≥0.3 band is
// the research-trigger threshold, so the dim-but-visible tier matters.
function strengthClass(strength: number): string {
  if (strength >= 0.7) return 'text-stone-50 border-neutral-700';
  if (strength >= 0.4) return 'text-neutral-400 border-neutral-800';
  if (strength >= 0.3) return 'text-neutral-600 border-neutral-800';
  return 'text-neutral-700 opacity-60 border-neutral-900';
}

export function InterestPill({ interest }: { interest: Interest }) {
  const selectedEntity = useUIStore((s) => s.selectedEntity);
  const selectEntity = useUIStore((s) => s.selectEntity);
  const isSelected = selectedEntity?.type === 'interest' && selectedEntity.label === interest.label;

  return (
    <button
      onClick={() => selectEntity({ type: 'interest', label: interest.label })}
      className={`rounded border px-2 py-1 font-mono text-xs ${strengthClass(interest.strength)} ${
        isSelected ? 'ring-1 ring-emerald-400' : ''
      }`}
      title={`strength ${interest.strength.toFixed(2)}`}
    >
      {interest.label}
    </button>
  );
}
