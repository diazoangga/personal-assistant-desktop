import { useMemo } from 'react';
import type { TraceStep } from '../../api/types';

// Observatory "signal spectrum" — color encodes the kind of work (see the
// redesign plan §5.1). Shared by the live inline timeline and the persisted
// session trace.
const KIND_COLOR: Record<string, string> = {
  agent: '#B79CFF', // violet
  tool: '#5CC8FF', // cyan
  skill: '#FFC55C', // amber
  llm: '#8A94A6', // slate
  worker: '#4ADE9E', // mint
};

const KIND_GLYPH: Record<string, string> = {
  agent: '◆',
  tool: '▸',
  skill: '✦',
  llm: '◊',
  worker: '⚙',
};

interface TraceNode extends TraceStep {
  children: TraceNode[];
}

/** Build a parent→children tree from the flat span list, preserving order. */
function buildTree(steps: TraceStep[]): TraceNode[] {
  const byId = new Map<string, TraceNode>();
  steps.forEach((s) => byId.set(s.id, { ...s, children: [] }));
  const roots: TraceNode[] = [];
  byId.forEach((node) => {
    const parent = node.parent_id ? byId.get(node.parent_id) : null;
    if (parent) parent.children.push(node);
    else roots.push(node);
  });
  return roots;
}

function StatusMark({ status }: { status: string }) {
  if (status === 'running')
    return <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-neutral-400" />;
  if (status === 'error') return <span className="shrink-0 text-red-400">✕</span>;
  return <span className="shrink-0 text-emerald-400">✓</span>;
}

function Row({ node, depth }: { node: TraceNode; depth: number }) {
  const color = KIND_COLOR[node.kind] ?? '#8A94A6';
  return (
    <>
      <li
        className="flex items-center gap-2 font-mono text-[11px] leading-relaxed"
        style={{ paddingLeft: `${depth * 14}px` }}
      >
        <span style={{ color }}>{KIND_GLYPH[node.kind] ?? '•'}</span>
        <span className="text-neutral-200">{node.name}</span>
        <StatusMark status={node.status} />
        {node.duration_ms != null && node.status !== 'running' && (
          <span className="text-neutral-600">{node.duration_ms}ms</span>
        )}
        {node.detail && (
          <span className="truncate text-neutral-600">— {node.detail}</span>
        )}
      </li>
      {node.children.map((c) => (
        <Row key={c.id} node={c} depth={depth + 1} />
      ))}
    </>
  );
}

/** Renders a span tree — the agent's "thought stream". */
export function TraceTimeline({ steps }: { steps: TraceStep[] }) {
  const tree = useMemo(() => buildTree(steps), [steps]);
  if (steps.length === 0) return null;
  return (
    <ul className="space-y-0.5">
      {tree.map((n) => (
        <Row key={n.id} node={n} depth={0} />
      ))}
    </ul>
  );
}
