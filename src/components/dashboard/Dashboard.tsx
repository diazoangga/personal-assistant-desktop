import { EventBusStream } from '../eventbus/EventBusStream';
import { InterestDecayMatrix } from '../interests/InterestDecayMatrix';
import { OpportunitiesPanel } from '../knowledge/OpportunitiesPanel';
import { ResearchPanel } from './ResearchPanel';
import { DigestPanel } from './DigestPanel';
import { WorkersPanel } from './WorkersPanel';

// Top row = the three hero panels the user asked for: Opportunities · Research ·
// Interests. Below: the daily digest, live activity (interactive + worker jobs),
// and worker status.
export function Dashboard() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="min-h-[220px]">
          <OpportunitiesPanel />
        </div>
        <div className="min-h-[220px]">
          <ResearchPanel />
        </div>
        <div className="min-h-[220px]">
          <InterestDecayMatrix />
        </div>
      </div>

      <DigestPanel />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EventBusStream />
        </div>
        <WorkersPanel />
      </div>
    </div>
  );
}
