import { useState } from 'react';
import type { KnowledgeEntry } from '../../api/types';

export function DigestItem({ entry }: { entry: KnowledgeEntry }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded border border-neutral-800 bg-neutral-950 p-2 text-sm">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start gap-2 text-left text-stone-50"
      >
        <span className="font-mono text-neutral-600">{open ? '▼' : '▶'}</span>
        <span>Q: {entry.question}</span>
      </button>
      {open && <p className="mt-1 pl-5 text-neutral-400">A: {entry.answer}</p>}
    </div>
  );
}
