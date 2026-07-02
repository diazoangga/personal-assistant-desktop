import { useCitation } from '../../hooks/useGraph';

export function CitationViewer({ citationId }: { citationId: string }) {
  const { data: citation, isLoading } = useCitation(citationId);

  if (isLoading) return <div className="text-sm text-neutral-600">Loading citation…</div>;
  if (!citation) return <div className="text-sm text-neutral-600">Citation not found.</div>;

  return (
    <div className="flex flex-col gap-2 text-sm">
      <h4 className="font-medium text-stone-50">{citation.title}</h4>
      <p className="text-xs text-neutral-400">{citation.authors.join(', ')}</p>
      <p className="text-neutral-400">{citation.abstract}</p>
      {citation.arxiv_url && (
        <a
          href={citation.arxiv_url}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-xs text-emerald-400"
        >
          arXiv ↗
        </a>
      )}
      {citation.linked_concepts.length > 0 && (
        <div>
          <p className="text-xs uppercase text-neutral-600">Linked concepts</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {citation.linked_concepts.map((c) => (
              <span key={c.id} className="rounded border border-neutral-800 px-2 py-0.5 font-mono text-xs text-neutral-400">
                {c.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
