# Flow — Manual Research (end to end)

The canonical action that exercises the whole app: launch a research run, watch it stream,
and see every dashboard update when it finishes.

## Steps

```
1. User presses ⌘K (or clicks "Manual Research")
     → uiStore.openResearchLauncher()  →  <ResearchLauncher> modal

2. User enters topic + depth (slider 1–5), submits
     → api.research(topic, depth)
     → POST /api/research { topic, depth }
     ← { job_id, kind: "research" }

3. App subscribes to the job
     → useJobStream(job_id) opens  WS /api/ws/events/{job_id}   (SSE fallback)
     ← started
     ← progress  { phase: "Searching sources…",  pct }
     ← progress  { phase: "Extracting concepts…", pct }
     ← …
     ← result    { ok: true, papers_new, concepts_new, relationships_found, run_id, summary }

4. <EventBusStream> renders the live JobProgressCard throughout (phase + bar).

5. On `result`, useJobStream invalidates the affected caches:
     queryClient.invalidate(['stats'])      → <GlobalCognitiveStats> re-fetches
     queryClient.invalidate(['interests'])  → <InterestDecayMatrix> re-fetches
     queryClient.invalidate(['graph'])      → <KnowledgeGraph> re-fetches
     queryClient.invalidate(['research','runs'])

6. The run lands as a collapsed log card; the new papers/concepts now appear in the graph,
   and the originating interest's strength reflects the run.
```

## What's exercised

- **Command path** — `POST /api/research` → `job_id` ([api-client.md](../architecture/api-client.md)).
- **Streaming** — WS event envelope, `EventHub` buffering on the backend
  ([live-research.md](../features/live-research.md)).
- **Cache coherence** — invalidate-on-`result` ties streamed state back to cached dashboards
  ([ADR-0002](../architecture/decisions/0002-tanstack-query-server-state.md)).

## Same flow, no click

A daemon-triggered run produces the **identical** `started→progress→result` stream and the
**same** dashboard refresh — it just appears without step 1–2. That equivalence is the
product's core demonstration of proactivity.

---

> **Source of truth:** `src/components/control/ResearchLauncher.tsx`,
> `src/hooks/useJobStream.ts`, `src/components/eventbus/EventBusStream.tsx`.
