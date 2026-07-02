// Full-canvas state shown while the backend is unreachable
// (docs/ARCHITECTURE.md §5, docs/UI_DESIGN.md §4).
export function OfflineScreen({ isRetrying }: { isRetrying: boolean }) {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-neutral-950 text-center font-mono">
      <div className="text-2xl text-red-400">● Backend offline</div>
      <p className="max-w-md text-sm text-neutral-400">
        The desktop app couldn't reach the Personal Assistant backend. Start it with:
      </p>
      <pre className="rounded border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm text-stone-50">
        poetry run python -m src.adapters.api
      </pre>
      <p className="text-xs text-neutral-600">{isRetrying ? 'Checking…' : 'Retrying automatically every 5s.'}</p>
    </div>
  );
}
