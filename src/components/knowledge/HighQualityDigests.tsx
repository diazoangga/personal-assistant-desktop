import { useKnowledge } from '../../hooks/useKnowledge';
import { DigestItem } from './DigestItem';

export function HighQualityDigests() {
  const { data: entries, isLoading } = useKnowledge();

  return (
    <div className="rounded border border-neutral-800 bg-neutral-900 p-3">
      <h3 className="mb-2 font-mono text-xs uppercase text-neutral-400">
        High-Quality Digests (quality ≥ 0.65)
      </h3>
      {isLoading && <div className="text-sm text-neutral-600">Loading…</div>}
      {!isLoading && (!entries || entries.length === 0) && (
        <div className="text-sm text-neutral-600">No curated Q&amp;A yet.</div>
      )}
      <div className="flex flex-col gap-1.5">
        {entries?.map((entry) => (
          <DigestItem key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}
