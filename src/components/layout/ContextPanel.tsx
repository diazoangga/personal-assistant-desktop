import { GlobalCognitiveStats } from '../control/GlobalCognitiveStats';
import { ActivityStream } from '../control/ActivityStream';
import { ContextInspector } from '../control/ContextInspector';
import { OpportunitiesPanel } from '../knowledge/OpportunitiesPanel';
import { MemoryPanel } from '../memory/MemoryPanel';
import { useUIStore } from '../../store/uiStore';
import { useSessionTrace } from '../../hooks/useOpportunities';
import { TraceTimeline } from '../trace/TraceTimeline';

function LiveTrace() {
  const sessionId = useUIStore((s) => s.activeSessionId);
  const { data: trace } = useSessionTrace(sessionId);
  if (!sessionId) return <p className="text-xs text-neutral-600">Open a chat to see its trace.</p>;
  if (!trace || trace.length === 0)
    return <p className="text-xs text-neutral-600">No spans yet for this session.</p>;
  return <TraceTimeline steps={trace} />;
}

export function ContextPanel() {
  return (
    <aside className="flex w-[300px] shrink-0 flex-col gap-0 overflow-y-auto border-l border-white/[0.06] bg-[#111114]">
      <Section title="Stats">
        <GlobalCognitiveStats />
      </Section>
      <Section title="Trace">
        <LiveTrace />
      </Section>
      <Section title="Memory">
        <MemoryPanel />
      </Section>
      <Section title="Opportunities">
        <OpportunitiesPanel />
      </Section>
      <Section title="Inspector">
        <ContextInspector />
      </Section>
      <Section title="Activity">
        <ActivityStream />
      </Section>
    </aside>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-white/[0.06] px-3 py-3">
      <h3 className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-neutral-600">{title}</h3>
      {children}
    </div>
  );
}
