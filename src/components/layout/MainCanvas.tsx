import { useUIStore } from '../../store/uiStore';
import { Dashboard } from '../dashboard/Dashboard';
import { ChatThread } from '../sessions/ChatThread';
import { KnowledgeGraph } from '../knowledge/KnowledgeGraph';

export function MainCanvas() {
  const canvasMode = useUIStore((s) => s.canvasMode);
  const activeSessionId = useUIStore((s) => s.activeSessionId);

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#0d0d0f]">
      {canvasMode === 'dashboard' && <Dashboard />}

      {canvasMode === 'graph' && (
        <div className="flex-1">
          <KnowledgeGraph />
        </div>
      )}

      {/* Unified conversation — orchestrator + sub-agents, one thread */}
      {canvasMode === 'chat' && (
        <div className="flex min-h-0 flex-1 flex-col p-4">
          <ChatThread sessionId={activeSessionId} />
        </div>
      )}
    </main>
  );
}
