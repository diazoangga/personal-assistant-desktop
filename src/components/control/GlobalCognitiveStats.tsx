import { useStats } from '../../hooks/useStats';

export function GlobalCognitiveStats() {
  const { data: stats, isLoading } = useStats();

  return (
    <div className="space-y-2">
      {isLoading && <p className="text-xs text-neutral-600">Loading…</p>}
      {stats && (
        <dl className="grid grid-cols-2 gap-2">
          <Stat label="Questions" value={stats.total_questions ?? 0} />
          <Stat label="Knowledge" value={stats.knowledge_entries} />
          <Stat label="Concepts" value={stats.concepts} />
        </dl>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-white/[0.03] px-2.5 py-2 border border-white/[0.05]">
      <div className="font-mono text-base font-semibold text-neutral-100">{value}</div>
      <div className="text-[10px] text-neutral-600">{label}</div>
    </div>
  );
}
