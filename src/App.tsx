import { useEffect } from 'react';
import { useHealth } from './hooks/useHealth';
import { useUIStore } from './store/uiStore';
import { OfflineScreen } from './components/layout/OfflineScreen';
import { Sidebar } from './components/layout/Sidebar';
import { MainCanvas } from './components/layout/MainCanvas';
import { ContextPanel } from './components/layout/ContextPanel';
import { ResearchLauncher } from './components/control/ResearchLauncher';
import { DaemonBadge } from './components/control/DaemonBadge';

export default function App() {
  const { data: health, isError, isLoading, isFetching } = useHealth();
  const openResearchLauncher = useUIStore((s) => s.openResearchLauncher);
  const openSession = useUIStore((s) => s.openSession);
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const contextPanelOpen = useUIStore((s) => s.contextPanelOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const toggleContextPanel = useUIStore((s) => s.toggleContextPanel);
  const canvasMode = useUIStore((s) => s.canvasMode);
  const closeSession = useUIStore((s) => s.closeSession);
  const showGraph = useUIStore((s) => s.showGraph);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      if (e.key === 'k') { e.preventDefault(); openResearchLauncher(); }
      else if (e.key === 'n') { e.preventDefault(); openSession(null); }
      else if (e.key === '\\') { e.preventDefault(); toggleSidebar(); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [openResearchLauncher, openSession, toggleSidebar]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0d0d0f]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-700 border-t-emerald-500" />
          <span className="text-xs text-neutral-500">Connecting…</span>
        </div>
      </div>
    );
  }

  if (isError || health?.status !== 'ok') {
    return <OfflineScreen isRetrying={isFetching} />;
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#0d0d0f] text-sm text-neutral-200">
      {/* Top bar */}
      <header className="flex h-11 shrink-0 items-center border-b border-white/[0.06] bg-[#111114] px-3 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={toggleSidebar}
            title="Toggle sidebar (⌘\)"
            className="flex h-7 w-7 items-center justify-center rounded text-neutral-500 hover:bg-white/[0.07] hover:text-neutral-200 transition-colors"
          >
            <SidebarIcon />
          </button>
          <span className="font-semibold text-neutral-100 tracking-tight text-sm select-none">PA</span>
          <span className="text-neutral-600 text-xs hidden sm:block">Personal Assistant</span>
        </div>

        <nav className="flex-1 flex items-center justify-center gap-1">
          <TabButton active={canvasMode === 'chat'} onClick={() => openSession(null)}>Chat</TabButton>
          <TabButton active={canvasMode === 'graph'} onClick={showGraph}>Graph</TabButton>
          <TabButton active={canvasMode === 'dashboard'} onClick={closeSession}>Dashboard</TabButton>
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={openResearchLauncher}
            title="Manual Research (⌘K)"
            className="hidden sm:flex items-center gap-1.5 rounded px-2.5 py-1 text-xs text-neutral-400 border border-white/[0.07] hover:bg-white/[0.07] hover:text-neutral-200 transition-colors"
          >
            <span className="font-mono">⌘K</span>
            <span>Research</span>
          </button>
          <DaemonBadge compact />
          <button
            onClick={toggleContextPanel}
            title="Toggle context panel"
            className="flex h-7 w-7 items-center justify-center rounded text-neutral-500 hover:bg-white/[0.07] hover:text-neutral-200 transition-colors"
          >
            <ContextPanelIcon />
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {sidebarOpen && <Sidebar />}
        <MainCanvas />
        {contextPanelOpen && <ContextPanel />}
      </div>

      <ResearchLauncher />
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? 'bg-white/[0.09] text-neutral-100'
          : 'text-neutral-500 hover:bg-white/[0.05] hover:text-neutral-300'
      }`}
    >
      {children}
    </button>
  );
}

function SidebarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" />
      <line x1="5" y1="2.5" x2="5" y2="13.5" />
    </svg>
  );
}

function ContextPanelIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" />
      <line x1="11" y1="2.5" x2="11" y2="13.5" />
    </svg>
  );
}
