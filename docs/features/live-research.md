# Feature — Live Research & Job Tracker

The most "alive" part of the UI: launch research and watch it execute in real time — and
see the daemon's autonomous runs in the *same* stream.

## Capabilities

| Capability | UI | Backend |
|---|---|---|
| Launch research | `<ResearchLauncher>` modal (topic + depth slider 1–5) | `POST /api/research { topic, depth }` |
| Live progress | `<EventBusStream>` / `<JobProgressCard>` | `WS /api/ws/events/{job_id}` (SSE fallback) |
| Completed run logs | `<EventBusStream>` history + run list | `GET /api/research/runs` |

## Notes

- The depth slider maps 1–5 → the backend's `shallow|normal|deep` (1–2 / 3 / 4–5); the
  backend normalizes either form.
- Progress phases stream as `progress` events (e.g. *"Fetching arXiv papers…"*, *"Extracting
  concept entities…"*) with an optional `pct` for the bar — these mirror the 8 steps of the
  Research Agent pipeline.
- The terminal `result` payload (`papers_found`, `papers_new`, `concepts_extracted`,
  `concepts_new`, `relationships_found`, `run_id`, `summary`) becomes the run's log card and
  triggers a refresh of the stats / interests / graph panels (cache invalidation in
  `useJobStream`).
- **Autonomous research** (daemon-triggered) shows up in the same stream — the user didn't
  launch it, which visibly demonstrates the proactive engine.

## UI states

- **Idle** — stream shows past runs.
- **Live** — 🟢 active job card with phase + progress bar.
- **Done** — collapsed run card with the result deltas.
- **Failed** — error card with the message; no cache invalidation.

---

> **Source of truth:** `src/components/control/ResearchLauncher.tsx`,
> `src/components/eventbus/`, `src/hooks/useJobStream.ts`, `src/store/jobsStore.ts`.
> Backend: `personal-assistant/docs/agents/research.md`,
> `personal-assistant/docs/api/streaming.md`.
