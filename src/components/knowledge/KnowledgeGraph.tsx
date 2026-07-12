import { useMemo, useState } from 'react';
import { ReactFlow, Background, Controls, type Node, type Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useGraph } from '../../hooks/useGraph';
import { useUIStore } from '../../store/uiStore';
import type { EntityCategory } from '../../api/types';

const CATEGORY_COLOR: Record<EntityCategory, string> = {
  concept: '#10b981', // emerald-500
  method: '#38bdf8', // sky-400
  model: '#a78bfa', // violet-400
  task: '#f59e0b', // amber-500
  dataset: '#f472b6', // pink-400
  metric: '#facc15', // yellow-400
  framework: '#fb923c', // orange-400
  paper: '#e5e5e5', // neutral-200
};

// Concept categories from entity extraction are open-ended (e.g. "general"),
// so fall back to a neutral color rather than rendering a transparent node.
const DEFAULT_NODE_COLOR = '#64748b'; // slate-500
const nodeColor = (category: string): string =>
  CATEGORY_COLOR[category as EntityCategory] ?? DEFAULT_NODE_COLOR;

// No layout coordinates come back from the backend, so lay nodes out on a
// simple deterministic circle — good enough for a depth-2 subgraph.
function layout(nodeIds: string[]): Record<string, { x: number; y: number }> {
  const radius = 220;
  const center = { x: 260, y: 220 };
  const positions: Record<string, { x: number; y: number }> = {};
  nodeIds.forEach((id, i) => {
    const angle = (2 * Math.PI * i) / Math.max(nodeIds.length, 1);
    positions[id] = {
      x: center.x + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle),
    };
  });
  return positions;
}

export function KnowledgeGraph() {
  const [topic, setTopic] = useState('');
  const [depth, setDepth] = useState(2);
  const { data, isLoading } = useGraph(topic, depth);
  const selectEntity = useUIStore((s) => s.selectEntity);

  const { nodes, edges } = useMemo<{ nodes: Node[]; edges: Edge[] }>(() => {
    if (!data) return { nodes: [], edges: [] };
    const positions = layout(data.nodes.map((n) => n.id));
    return {
      nodes: data.nodes.map((n) => ({
        id: n.id,
        position: positions[n.id] ?? { x: 0, y: 0 },
        data: { label: n.label },
        style: {
          background: nodeColor(n.category),
          color: '#0a0a0a',
          fontFamily: 'monospace',
          fontSize: 11,
          border: 'none',
        },
      })),
      edges: data.edges.map((e, i) => ({
        id: `${e.source}-${e.target}-${i}`,
        source: e.source,
        target: e.target,
        label: e.relation_type,
        style: { stroke: '#404040' },
        labelStyle: { fill: '#737373', fontSize: 10 },
      })),
    };
  }, [data]);

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center gap-2 font-mono text-xs">
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="filter by topic (blank = whole graph)…"
          className="flex-1 rounded border border-neutral-800 bg-neutral-950 px-2 py-1 text-stone-50 outline-none focus:border-neutral-600"
        />
        <select
          value={depth}
          onChange={(e) => setDepth(Number(e.target.value))}
          className="rounded border border-neutral-800 bg-neutral-950 px-1 py-1 text-neutral-400"
        >
          {[1, 2, 3].map((d) => (
            <option key={d} value={d}>
              depth {d}
            </option>
          ))}
        </select>
      </div>
      <div className="h-64 flex-1 rounded border border-neutral-800 bg-neutral-950">
        {isLoading && <p className="p-3 text-sm text-neutral-400">Loading graph…</p>}
        {!isLoading && nodes.length === 0 && (
          <p className="p-3 text-sm text-neutral-400">
            {topic
              ? `No concepts found for "${topic}".`
              : 'No concepts yet — run some research to populate the graph.'}
          </p>
        )}
        {nodes.length > 0 && (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodeClick={(_, node) => {
              const original = data?.nodes.find((n) => n.id === node.id);
              if (original) selectEntity({ type: 'node', id: original.id, label: original.label, category: original.category });
            }}
            fitView
            colorMode="dark"
          >
            <Background />
            <Controls showInteractive={false} />
          </ReactFlow>
        )}
      </div>
    </div>
  );
}
