import { create } from 'zustand';

interface JobsState {
  // Most-recent-first list of job ids the EventBusStream renders. Populated
  // when the user launches a command (research/ask/brainstorm). There is no
  // backend endpoint yet to discover daemon-triggered job ids on their own
  // (see docs/FEATURES.md Module 2) — once one exists, the daemon's jobs can
  // be pushed in here the same way.
  jobIds: string[];
  trackJob: (jobId: string) => void;
}

const MAX_TRACKED = 20;

export const useJobsStore = create<JobsState>((set) => ({
  jobIds: [],
  trackJob: (jobId) =>
    set((s) => ({ jobIds: [jobId, ...s.jobIds.filter((id) => id !== jobId)].slice(0, MAX_TRACKED) })),
}));
