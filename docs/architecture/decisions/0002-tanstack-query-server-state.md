# ADR-0002: TanStack Query for server state

**Status:** Accepted · **Date:** 2026-06

## Context

Almost everything the app displays is **owned by the backend** (interests, stats, graph,
sessions, knowledge, daemon status) and changes over time — both on a polling cadence and in
response to jobs the user launches. We needed caching, background refetch, and a clean way
to refresh dashboards when a job finishes, without hand-rolling fetch/cache/invalidate.

## Decision

Use **TanStack Query** for all server state, with per-panel `refetchInterval`s, and treat
the backend as the single source of truth (no local mutation of server data). The live job
stream is separate (a `useJobStream` hook over WebSocket); on a job's terminal `result` the
hook **invalidates** the affected query keys (`stats`, `interests`, `graph`,
`research/runs`) so the dashboards re-fetch.

## Consequences

- **+** Polling, caching, and dedup come for free; panels stay fresh.
- **+** The "a finished job changes the world → invalidate" pattern keeps streamed state and
  cached state consistent with one line per affected key.
- **+** Pure UI state (selection, modals) stays small and lives in Zustand, cleanly
  separated from server state.
- **−** Two state systems (Query for server, Zustand for UI, plus the stream hook) — the
  boundaries must be respected or caches drift.
- **−** Polling intervals are a guess; too-frequent polling wastes the loopback round-trips,
  too-slow feels stale (mitigated by invalidate-on-`result`).
