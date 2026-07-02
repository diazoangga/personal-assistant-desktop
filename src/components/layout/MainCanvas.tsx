import { useUIStore } from '../../store/uiStore';
import { EventBusStream } from '../eventbus/EventBusStream';
import { InterestDecayMatrix } from '../interests/InterestDecayMatrix';
import { HighQualityDigests } from '../knowledge/HighQualityDigests';
import { ChatThread } from '../sessions/ChatThread';
import { IdeationBoard } from '../sessions/IdeationBoard';
import { KnowledgeGraph } from '../knowledge/KnowledgeGraph';

export function MainCanvas() {
  const canvasMode = useUIStore((s) => s.canvasMode);
  const activeSessionId = useUIStore((s) => s.activeSessionId);

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#0d0d0f]">
      {/* Dashboard: event stream + matrix + digests */}
      {canvasMode === 'dashboard' && (
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
          <EventBusStream />
          <InterestDecayMatrix />
          <HighQualityDigests />
        </div>
      )}

      {/* Knowledge graph */}
      {canvasMode === 'graph' && (
        <div className="flex-1">
          <KnowledgeGraph />
        </div>
      )}

      {/* Chat session */}
      {canvasMode === 'ask' && (
        <div className="flex min-h-0 flex-1 flex-col p-4">
          <ChatThread sessionId={activeSessionId} />
        </div>
      )}

      {/* Brainstorm session */}
      {canvasMode === 'brainstorm' && (
        <div className="flex min-h-0 flex-1 flex-col p-4">
          <IdeationBoard sessionId={activeSessionId} />
        </div>
      )}
    </main>
  );
}
