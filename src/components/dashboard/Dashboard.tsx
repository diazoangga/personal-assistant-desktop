import { EventBusStream } from '../eventbus/EventBusStream';
import { InterestDecayMatrix } from '../interests/InterestDecayMatrix';
import { HighQualityDigests } from '../knowledge/HighQualityDigests';

// P4 expands this into the Opportunities · Research · Interests top panel.
export function Dashboard() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
      <EventBusStream />
      <InterestDecayMatrix />
      <HighQualityDigests />
    </div>
  );
}
