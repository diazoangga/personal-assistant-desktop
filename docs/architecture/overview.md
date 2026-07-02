# Architecture Overview

The desktop app is a **thin, reactive view layer** over the Personal Assistant engine. It
holds no cognitive logic — everything it shows comes from the backend's loopback HTTP API,
and everything the user does is a command POSTed to that API. Its job is to make the
engine's autonomous behavior **legible and steerable**.

## The big picture

```
┌───────────────────────── Tauri app (this repo) ──────────────────────────┐
│  WebView (React + TypeScript + Vite + Tailwind)                           │
│    ├── Sidebar       sessions · New Session · Manual Research · daemon     │
│    ├── Main Canvas   EventBus stream · Interest Decay Matrix · Digests     │
│    └── Context Panel global stats · Knowledge Graph · Context Inspector    │
│                                                                           │
│  api/ client  ──HTTP──▶  GET  /api/stats, /interests, /graph/subgraph …    │
│               ──POST──▶  POST /api/ask, /research, /brainstorm …            │
│               ──WS────▶  WS   /api/ws/events/{job_id}  (live event stream)  │
│                                                                           │
│  Rust core (src-tauri)  ── window · tray · (later) spawn/supervise backend │
└──────────────────────────────────┬────────────────────────────────────────┘
                                    ▼  http://127.0.0.1:8787
                  personal-assistant backend (separate process)
```

## Tech stack

| Concern | Choice | Notes |
|---|---|---|
| Shell | **Tauri 2.x** | Rust core + system WebView; small binary, native window/tray. See [ADR-0001](decisions/0001-tauri-over-electron.md). |
| UI | **React 18 + TypeScript** | function components + hooks |
| Build/dev | **Vite** | dev server on `http://localhost:1420` |
| Styling | **Tailwind CSS** | dark `neutral`/`stone` theme ([design-system/foundations.md](../design-system/foundations.md)) |
| Server state | **TanStack Query** | polling + invalidate-on-`Result` ([ADR-0002](decisions/0002-tanstack-query-server-state.md)) |
| Streaming | native **WebSocket** (SSE fallback) | per-job event stream |
| Graph viz | **React Flow** (`@xyflow/react`) | knowledge-graph explorer |
| HTTP | **axios** | |
| Client UI state | **Zustand** (`store/uiStore.ts`, `jobsStore.ts`) | selection, modals, active session |
| Routing | **none** | one workspace; panels update in place ([ADR-0003](decisions/0003-three-panel-no-routing.md)) |

## State model — three kinds, kept separate

1. **Server state** (owned by the backend, cached here) — interests, stats, knowledge,
   graph, sessions, daemon status. **TanStack Query** with per-panel polling intervals.
   Never mutated locally; the backend is the source of truth.
2. **Job/stream state** (ephemeral, per running command) — the live `progress` events of an
   in-flight `research`/`ask`/`brainstorm` job. The `useJobStream` hook owns one job over a
   WebSocket; on the terminal `result` it invalidates the affected Query caches so the
   dashboards refresh.
3. **Pure UI state** (local) — which session is active, which graph node is selected, which
   modal is open. Plain React state / Zustand. Not persisted to the backend.

## Data flow for a typical action (manual research)

```
user clicks "Research" (depth 4)
  → POST /api/research { topic, depth:"deep" }    → { job_id }
  → useJobStream(job_id) opens WS                 → started, progress×N, result
  → EventBusStream renders the live progress bar + phase messages
  → on result: queryClient.invalidate(['stats','interests','graph','research','runs'])
  → dashboards re-fetch and reflect the new papers/concepts
```

See [flows/manual-research.md](../flows/manual-research.md) for the full walkthrough and
[architecture/api-client.md](api-client.md) for the client and `useJobStream`.

## Repo layout

```
src/
├── main.tsx · App.tsx          three-panel shell + health gate + ⌘K/⌘N shortcuts
├── api/{client,types}.ts       PersonalAssistantAPI + typed contracts
├── hooks/                      useHealth, useStats, useInterests, useJobStream, useGraph,
│                               useKnowledge, useSessions, useActivity, useDaemonStatus
├── components/
│   ├── layout/                 Sidebar, MainCanvas, ContextPanel, OfflineScreen
│   ├── eventbus/               EventBusStream, JobProgressCard, JobStreamItem
│   ├── interests/              InterestDecayMatrix, InterestPill
│   ├── knowledge/              KnowledgeGraph, CitationViewer, HighQualityDigests, DigestItem
│   ├── sessions/               SessionList, SessionItem, ChatThread, IdeationBoard
│   └── control/                DaemonBadge, GlobalCognitiveStats, ActivityStream,
│                               ResearchLauncher, ContextInspector
└── store/                      Zustand: uiStore, jobsStore
src-tauri/                      Rust core: window/tray, (later) backend supervisor
```

---

> **Source of truth:** `src/App.tsx`, `src/store/`, `package.json`, `src-tauri/`.
> Backend boundary: [architecture/backend-lifecycle.md](backend-lifecycle.md).
