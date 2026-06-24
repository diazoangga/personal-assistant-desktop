# Architecture

> How the desktop app is built and how it talks to the backend.
> **Last updated:** 2026-06-24

---

## 1. The big picture

The desktop app is a **thin, reactive view layer** over the Personal Assistant engine.
It holds no cognitive logic of its own — no interest scoring, no research, no LLM calls.
Everything it shows comes from the backend's local HTTP API; everything the user does is
a command POSTed to that API. Its job is to make the engine's autonomous behavior
**legible and steerable**.

```
┌───────────────────────────── Tauri app (this repo) ─────────────────────────────┐
│                                                                                  │
│  WebView (React + TypeScript + Vite + Tailwind)                                  │
│    ├── Sidebar       sessions, "New Session", "Manual Research", daemon badge    │
│    ├── Main Canvas   EventBus stream · Interest Decay Matrix · Digests · Chat    │
│    └── Context Panel global stats · Knowledge Graph · Context Inspector          │
│                                                                                  │
│  api/ client  ──HTTP──▶  GET  /api/stats, /api/interests, /api/graph/subgraph …  │
│               ──POST──▶  POST /api/ask, /api/research, /api/brainstorm …          │
│               ──WS────▶  WS   /api/ws/events/{job_id}   (live Progress stream)    │
│                                                                                  │
│  Rust core (src-tauri)  ── window, tray, optional: spawn/supervise backend ──    │
└──────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼  http://127.0.0.1:8787
                       personal-assistant backend (separate process)
```

## 2. Tech stack

| Concern | Choice | Notes |
|---|---|---|
| Shell | **Tauri 2.x** | Rust core + system WebView. Small binaries, native window/tray. |
| UI | **React 18 + TypeScript** | Function components + hooks. |
| Build/dev | **Vite** | Tauri's default; dev server on `http://localhost:1420`. |
| Styling | **Tailwind CSS** | Matches the mockup's `neutral-*` / `stone-*` token vocabulary. |
| Server state | **TanStack Query** | Polling/caching for dashboard reads (`/stats`, `/interests`, …). |
| Streaming | **Native `WebSocket`** (SSE fallback) | Per-job `Progress`/`Result` events. |
| Graph viz | **React Flow** (or Cytoscape.js) | Knowledge Graph Explorer node-link diagram. |
| HTTP | **axios** | Reuses the shape of the old Mini App client. |
| Routing | **None / minimal** | It's a single workspace view, not a multi-page site. Panels are stateful, not routed. |

> **Why Tauri, not Electron:** the backend is already a separate Python process, so we
> don't need Node in the shell. Tauri gives a smaller footprint and a Rust core we can
> later use to **spawn and supervise the backend** (see §5).

## 3. Repo layout (planned)

```
personal-assistant-desktop/
├── README.md
├── docs/                      ARCHITECTURE · UI_DESIGN · FEATURES · API_INTEGRATION
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── src/                       # WebView app
│   ├── main.tsx
│   ├── App.tsx                # three-panel shell layout
│   ├── api/
│   │   ├── client.ts          # PersonalAssistantAPI (REST + SSE/WS)
│   │   └── types.ts           # EventUpdate, Interest, GraphData, Stats, …
│   ├── hooks/
│   │   ├── useJobStream.ts     # subscribe to a job's WS/SSE event stream
│   │   ├── useStats.ts         # TanStack Query wrappers per endpoint
│   │   ├── useInterests.ts
│   │   └── useDaemonStatus.ts
│   ├── components/
│   │   ├── layout/            # Sidebar, MainCanvas, ContextPanel
│   │   ├── eventbus/          # EventBusStream, JobProgressCard
│   │   ├── interests/         # InterestDecayMatrix, InterestPill, Timeline
│   │   ├── knowledge/         # DigestList, KnowledgeGraph, CitationViewer
│   │   ├── sessions/          # SessionList, ChatThread, IdeationBoard
│   │   └── control/           # DaemonBadge, ActivityStream, ResearchLauncher
│   └── store/                 # client UI state (selected node, active session…)
└── src-tauri/                 # Rust core
    ├── tauri.conf.json
    ├── Cargo.toml
    └── src/main.rs            # window/tray; (optional) backend supervisor command
```

## 4. State model

Two distinct kinds of state, kept separate:

1. **Server state** (owned by the backend, cached here) — interests, stats, knowledge
   entries, graph, sessions, daemon status. Managed by **TanStack Query** with polling
   intervals tuned per panel (see [FEATURES.md](FEATURES.md) §refresh cadence). Never
   mutated locally; the backend is the source of truth.
2. **Job/stream state** (ephemeral, per running command) — the live `Progress` events
   of an in-flight `research`/`ask`/`brainstorm` job. Managed by the `useJobStream`
   hook over a WebSocket; on `Result` it invalidates the relevant Query caches so the
   dashboards refresh (e.g. a finished research run updates `/stats`, `/interests`,
   `/graph`).
3. **Pure UI state** (local) — which session is active, which graph node is selected,
   which panel tab is open. Plain React state / a small Zustand store. Not persisted to
   the backend.

Data flow for a typical action (manual research):

```
user clicks "Research" (depth 4)
  → POST /api/research { topic, depth:"deep" }   → { job_id }
  → useJobStream(job_id) opens WS                → Started, Progress×N, Result
  → EventBusStream renders the live progress bar + phase messages
  → on Result: queryClient.invalidate(['stats','interests','graph','research/runs'])
  → dashboards re-fetch and reflect the new papers/concepts
```

## 5. Backend lifecycle (the "two services" question)

The product is two processes. Three options for managing them, in order of build effort:

| Option | How | When |
|---|---|---|
| **Manual (MVP)** | User starts the backend (`python -m src.adapters.api`) themselves; the app just connects. | Now — simplest, documented in README. |
| **Supervised** | Rust core (`src-tauri`) spawns the backend as a child process on launch and kills it on quit, via a Tauri command. | Once packaging for non-developers. |
| **Health-gated UI** | App polls `GET /api/health`; shows a "Backend offline — start it" screen until reachable, then connects. | Pairs with either of the above. |

The MVP assumes **Manual + Health-gated**: connect if up, show a clear "start the
backend" screen if not. Supervised spawn is a later enhancement and is why the shell is
Tauri (Rust can own the child process cleanly).

## 6. Security & boundaries

- The API binds **loopback only** (`127.0.0.1:8787`). No remote exposure.
- Optional `LOCAL_API_TOKEN` (bearer) if the user wants belt-and-suspenders; the client
  reads it from Tauri config / env and attaches `Authorization: Bearer`.
- The WebView's CSP must allow `connect-src http://127.0.0.1:8787 ws://127.0.0.1:8787`.
- No Telegram, no `initData`, no public tunnels. Single local user (`LOCAL_API_USER`,
  default `local`).
