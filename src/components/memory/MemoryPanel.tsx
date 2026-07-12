import { useMemory, useForgetMemory } from '../../hooks/useMemory';
import type { MemoryEntry } from '../../api/types';

// Scope → the Observatory signal color, so memory reads as part of the same system.
const SCOPE_META: Record<string, { color: string; label: string }> = {
  core: { color: '#B79CFF', label: 'core' },
  procedural: { color: '#FFC55C', label: 'rule' },
  semantic: { color: '#5CC8FF', label: 'fact' },
};

function Row({ m }: { m: MemoryEntry }) {
  const forget = useForgetMemory();
  const meta = SCOPE_META[m.scope] ?? { color: '#8A94A6', label: m.scope };
  return (
    <li className="group flex items-start gap-2 text-xs">
      <span
        className="mt-1 shrink-0 rounded px-1 font-mono text-[9px] uppercase"
        style={{ color: meta.color, border: `1px solid ${meta.color}33` }}
      >
        {meta.label}
      </span>
      <span className="flex-1 text-neutral-300 leading-snug">{m.content}</span>
      <button
        onClick={() => forget.mutate(m.id)}
        title="Forget"
        className="shrink-0 text-neutral-700 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
      >
        ✕
      </button>
    </li>
  );
}

/** "What the assistant remembers" — inspect and curate the memory scopes. */
export function MemoryPanel() {
  const { data: entries, isLoading } = useMemory();

  if (isLoading) return <p className="text-xs text-neutral-600">Loading memory…</p>;
  if (!entries || entries.length === 0)
    return (
      <p className="text-xs text-neutral-600 leading-relaxed">
        Nothing remembered yet. As you chat, durable facts and preferences land here.
      </p>
    );

  return (
    <ul className="space-y-2">
      {entries.map((m) => (
        <Row key={m.id} m={m} />
      ))}
    </ul>
  );
}
