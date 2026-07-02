import { useActivity } from '../../hooks/useActivity';

export function ActivityStream() {
  const { data: items, isLoading } = useActivity();

  return (
    <div className="space-y-1.5">
      {isLoading && <p className="text-xs text-neutral-600">Loading…</p>}
      {!isLoading && (!items || items.length === 0) && (
        <p className="text-xs text-neutral-600">No connector activity yet.</p>
      )}
      <ul className="space-y-1.5">
        {items?.map((item) => (
          <li key={item.id} className="flex gap-2 text-xs">
            <span className="mt-px shrink-0 font-mono text-neutral-700">[{item.source}]</span>
            <span className="text-neutral-400 leading-relaxed">{item.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
