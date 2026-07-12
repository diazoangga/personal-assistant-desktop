import { useUIStore } from '../../store/uiStore';
import { SessionList } from '../sessions/SessionList';

export function Sidebar() {
  const openSession = useUIStore((s) => s.openSession);
  const openResearchLauncher = useUIStore((s) => s.openResearchLauncher);
  const showGraph = useUIStore((s) => s.showGraph);
  const canvasMode = useUIStore((s) => s.canvasMode);

  return (
    <aside className="flex w-[240px] shrink-0 flex-col border-r border-white/[0.06] bg-[#111114]">
      {/* Nav actions */}
      <div className="flex flex-col gap-1 p-3 border-b border-white/[0.06]">
        <button
          onClick={() => openSession(null)}
          className="flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-left text-xs font-semibold text-white hover:bg-emerald-500 transition-colors"
        >
          <span className="text-base leading-none">+</span>
          New Chat
        </button>
        <button
          onClick={openResearchLauncher}
          className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-xs text-neutral-400 hover:bg-white/[0.05] hover:text-neutral-200 transition-colors"
        >
          <span>🔬</span>
          Manual Research
          <span className="ml-auto font-mono text-neutral-600">⌘K</span>
        </button>
        <button
          onClick={showGraph}
          className={`flex items-center gap-2 rounded-md px-3 py-2 text-left text-xs transition-colors ${
            canvasMode === 'graph'
              ? 'bg-white/[0.08] text-neutral-100'
              : 'text-neutral-400 hover:bg-white/[0.05] hover:text-neutral-200'
          }`}
        >
          <span>🕸️</span>
          Knowledge Graph
        </button>
      </div>

      {/* Session list */}
      <div className="min-h-0 flex-1 overflow-y-auto py-2 px-2">
        <SessionList />
      </div>
    </aside>
  );
}
