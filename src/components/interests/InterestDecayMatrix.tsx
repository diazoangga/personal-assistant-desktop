import { useInterests } from '../../hooks/useInterests';
import { InterestPill } from './InterestPill';

const BUCKETS = [
  { min: 0.7, label: '≥ 0.70' },
  { min: 0.4, label: '0.40–0.69' },
  { min: 0.3, label: '0.30–0.39' },
  { min: 0, label: '< 0.30' },
];

export function InterestDecayMatrix() {
  const { data: interests, isLoading } = useInterests();

  if (isLoading) {
    return <div className="text-sm text-neutral-600">Loading interests…</div>;
  }

  if (!interests || interests.length === 0) {
    return (
      <div className="rounded border border-neutral-800 bg-neutral-900 p-3 text-sm text-neutral-600">
        The daemon hasn't learned anything about you yet — ask something or run research.
      </div>
    );
  }

  const sorted = [...interests].sort((a, b) => b.strength - a.strength);

  return (
    <div className="rounded border border-neutral-800 bg-neutral-900 p-3">
      <h3 className="mb-2 font-mono text-xs uppercase text-neutral-400">
        Interest Decay Matrix (get_strength)
      </h3>
      <div className="flex flex-col gap-1.5">
        {BUCKETS.map((bucket) => {
          const next = BUCKETS[BUCKETS.indexOf(bucket) - 1]?.min ?? Infinity;
          const items = sorted.filter((i) => i.strength >= bucket.min && i.strength < next);
          if (items.length === 0) return null;
          return (
            <div key={bucket.label} className="flex items-center gap-2">
              <span className="w-20 font-mono text-xs text-neutral-600">({bucket.label})</span>
              <div className="flex flex-wrap gap-1.5">
                {items.map((interest) => (
                  <InterestPill key={interest.id} interest={interest} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
