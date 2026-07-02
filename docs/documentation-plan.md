# Personal Assistant Desktop — Documentation Plan

> **Scope of this document:** the plan for *what we build* and *what we document* in
> `D:/personal-assistant-desktop` (the Tauri desktop client). It is the source of truth for
> the FE architecture, the documentation set, and build milestones. The companion backend
> plan lives in `D:/personal-assistant/docs/documentation-plan.md` and owns the local web
> API this app consumes.

---

## 1. Product in one paragraph

The desktop app is a **thin, reactive view layer** over the Personal Assistant cognitive
engine. It holds no cognitive logic of its own — no interest scoring, no research, no LLM
calls. Everything it shows comes from the backend's loopback HTTP API; everything the user
does is a command POSTed to that API. Its job is to make the engine's autonomous behavior
**legible and steerable**: a three-panel workspace showing a live EventBus stream of
research jobs, a decaying interest model, a knowledge-graph explorer, high-quality Q&A
digests, and the daemon's activity. It is a **Tauri** shell (Rust core + system WebView)
running a React app that connects to `personal-assistant` on `127.0.0.1:8787`.

### Locked technical decisions
| Decision | Choice |
|---|---|
| Shell | **Tauri 2.x** (Rust core + system WebView) — small binary, can later supervise the backend |
| UI | **React 18 + TypeScript**, function components + hooks |
| Build/dev | **Vite** (dev server on `:1420`) |
| Styling | **Tailwind CSS** — dark, terminal-adjacent `neutral`/`stone` theme |
| Server state | **TanStack Query** (polling + cache invalidation on job `Result`) |
| Streaming | native **WebSocket** (SSE fallback) for per-job events |
| Graph viz | **React Flow** (`@xyflow/react`) |
| HTTP | **axios** |
| Client UI state | **Zustand** (selected node, active session, modals) |
| Routing | **none** — one workspace; panels update in place |

---

## 2. Documentation set we will produce

```
docs/
├── documentation-plan.md              # THIS FILE — index + plan
├── architecture/
│   ├── overview.md                    # Tauri process model, state model, repo layout, data flow
│   ├── api-client.md                  # client shape, event envelope, useJobStream, TanStack patterns
│   ├── backend-lifecycle.md           # the "two services" question, supervised spawn, health-gating, security
│   └── decisions/                     # ADRs
│       ├── 0001-tauri-over-electron.md
│       ├── 0002-tanstack-query-server-state.md
│       └── 0003-three-panel-no-routing.md
├── design-system/
│   ├── foundations.md                 # color tokens, the interest-decay color language, typography
│   └── layout.md                      # three-panel shell, component tree, interaction model, a11y
├── features/                          # the 5 feature modules, each mapped to BE endpoints + components
│   ├── cognitive-sessions.md          # ask & brainstorm
│   ├── live-research.md               # research + job tracker
│   ├── interest-decay.md              # interest & decay dashboard
│   ├── knowledge-graph.md             # graph explorer + citation viewer
│   └── control-center.md              # daemon status, stats, activity
├── flows/
│   └── manual-research.md             # end-to-end: launch research → stream → dashboards refresh
└── ops/
    └── local-dev.md                   # two-process run, env, Tauri vs browser dev
```

> **Convention:** each `features/*.md` carries a capability→UI→endpoint table and the UI
> states (empty/loading/error/live); design docs carry the wireframe and token tables.
> Backend endpoint contracts are owned by `personal-assistant/docs/api/`.

---

## 3. Information architecture (the three-panel workspace)

No page navigation — a fixed three-column shell whose panels update in place:

```
SIDEBAR (260px)            MAIN CANVAS (flex-1)              CONTEXT PANEL (320px)
  + New Session              EventBus stream (live jobs)        Global cognitive stats
  🔬 Manual Research          Interest decay matrix              Knowledge graph explorer
  Sessions list              High-quality digests               Context inspector
  Daemon badge (footer)      ChatThread | IdeationBoard           └ Citation viewer
```

Mounting is **health-gated**: the app polls `GET /api/health` and shows a full-canvas
"Start the backend" screen until the backend is reachable, then mounts the workspace.

---

## 4. Target module layout

```
personal-assistant-desktop/            # repo root
├── index.html · vite.config.ts · tailwind.config.js · tsconfig.json
├── src/                               # WebView app
│   ├── main.tsx · App.tsx             # three-panel shell + health gate + keyboard shortcuts
│   ├── api/
│   │   ├── client.ts                  # PersonalAssistantAPI (REST + SSE/WS)
│   │   └── types.ts                   # EventUpdate, Interest, GraphData, Stats, …
│   ├── hooks/                         # useHealth, useStats, useInterests, useJobStream, useGraph,
│   │                                  #   useKnowledge, useSessions, useActivity, useDaemonStatus
│   ├── components/
│   │   ├── layout/                    # Sidebar, MainCanvas, ContextPanel, OfflineScreen
│   │   ├── eventbus/                  # EventBusStream, JobProgressCard, JobStreamItem
│   │   ├── interests/                 # InterestDecayMatrix, InterestPill
│   │   ├── knowledge/                 # KnowledgeGraph, CitationViewer, HighQualityDigests, DigestItem
│   │   ├── sessions/                  # SessionList, SessionItem, ChatThread, IdeationBoard
│   │   └── control/                   # DaemonBadge, GlobalCognitiveStats, ActivityStream,
│   │                                  #   ResearchLauncher, ContextInspector
│   └── store/                         # Zustand: uiStore (selection, modals), jobsStore
└── src-tauri/                         # Rust core: window/tray, (later) backend supervisor
    ├── tauri.conf.json · Cargo.toml · src/{main,lib}.rs
```

---

## 5. Feature modules (mapped to backend)

| Module | Doc | Key endpoints |
|---|---|---|
| Cognitive Sessions (ask/brainstorm) | [features/cognitive-sessions.md](features/cognitive-sessions.md) | `POST /api/ask`, `/api/brainstorm`, `GET /api/sessions`, `/sessions/{id}/turns`, `/knowledge` |
| Live Research & Job Tracker | [features/live-research.md](features/live-research.md) | `POST /api/research`, `WS /api/ws/events/{job_id}`, `GET /api/research/runs` |
| Interest & Decay Dashboard | [features/interest-decay.md](features/interest-decay.md) | `GET /api/interests`, `/interests/{label}/timeline` |
| Knowledge Graph Explorer | [features/knowledge-graph.md](features/knowledge-graph.md) | `GET /api/graph/subgraph`, `/citations/{id}` |
| Control Center & Daemon | [features/control-center.md](features/control-center.md) | `GET /api/daemon/status`, `/stats`, `/activity` |

---

## 6. Milestones (build + doc order)

| # | Milestone | FE deliverables | Docs |
|---|---|---|---|
| M0 ✅ | Scaffold + shell | Tauri + Vite + Tailwind, three-panel layout, health gate, keyboard shortcuts | `architecture/overview.md`, `design-system/{foundations,layout}.md`, ADR-0001/0003 |
| M1 ✅ | API client | `PersonalAssistantAPI`, typed `types.ts`, TanStack Query hooks, `useJobStream` | `architecture/api-client.md`, ADR-0002 |
| M2 ✅ | Sessions + Research | SessionList/ChatThread/IdeationBoard, ResearchLauncher, EventBus stream | `features/{cognitive-sessions,live-research}.md`, `flows/manual-research.md` |
| M3 ✅ | Dashboards | InterestDecayMatrix, KnowledgeGraph + CitationViewer, GlobalCognitiveStats, ActivityStream | `features/{interest-decay,knowledge-graph,control-center}.md` |
| M4 ◻ | Packaging | Tauri build, (optional) backend supervisor in the Rust core | `architecture/backend-lifecycle.md` §supervised |

> **Status:** scaffolded. The React app (shell, client, hooks, all 5 feature modules) and
> the Tauri shell config are implemented per these docs. `src-tauri` has not been compiled
> (no local Rust toolchain), so `pnpm tauri dev` is untested; `pnpm dev` (browser) works.

---

## 7. Dependencies & contract with the backend
- The API contract is owned by `personal-assistant/docs/api/`
  ([rest-reference](../../personal-assistant/docs/api/rest-reference.md),
  [streaming](../../personal-assistant/docs/api/streaming.md)); any endpoint change ships
  there first.
- The streamed **event envelope** (`started/progress/message/result/error`) is co-owned —
  documented here in `architecture/api-client.md` and in the BE `api/streaming.md`.
- The product is **two processes**: this app + the backend on `:8787`. See
  `architecture/backend-lifecycle.md`.

---

## 8. Open questions
- **Backend lifecycle**: manual start (MVP) vs Rust-supervised child process (packaging).
- **Graph viz** scale: React Flow is fine for small subgraphs; large graphs may need
  clustering/virtualization.
- **Theme**: dark-only today; light theme not planned for MVP.
- **Daemon control** (start/stop from the UI) is out of scope — the badge is read-only.
