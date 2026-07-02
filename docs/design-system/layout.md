# Layout & Component Tree

A fixed three-column workspace. No page navigation — panels update in place. The spine of
the right panel is **selection**: clicking an interest pill or graph node drives the Context
Inspector.

## Reference layout

```
┌──────────────────────────┬──────────────────────────────────────┬──────────────────────────┐
│  SIDEBAR (260px)         │  MAIN CANVAS (flex-1)                │  CONTEXT PANEL (320px)   │
│  bg-neutral-900          │  bg-neutral-950                      │  bg-neutral-900          │
├──────────────────────────┼──────────────────────────────────────┼──────────────────────────┤
│ [ + New Session ]        │ ┌ PROACTIVE EVENTBUS STREAM ────────┐ │ GLOBAL COGNITIVE STATS   │
│ [ 🔬 Manual Research ]   │ │ 🟢 daemon // Job #8092 Active      │ │  Total Questions:  142   │
│                          │ │ Progress [██████████░░░░] 64%      │ │  Knowledge Seeds:   89   │
│ SESSIONS                 │ │ › Fetching arXiv papers for "…"    │ │  Concepts Mapped:  412   │
│  • GraphRAG Routing      │ └────────────────────────────────────┘ │                          │
│  • Nix Env Config        │ ┌ INTEREST DECAY MATRIX ─────────────┐ │ KNOWLEDGE EXPLORER       │
│  • Causal Inference      │ │ (0.85) [GraphRAG] [Markov Chains]  │ │   (○) GraphRAG           │
│                          │ │ (0.55) [Causal Inference]          │ │    └─(●) PageRank        │
│                          │ │ (0.31) [Nix Environments]          │ │        └─(○) Paper       │
│                          │ └────────────────────────────────────┘ │                          │
│ 🟢 Daemon: Active        │ ┌ HIGH-QUALITY DIGESTS (≥ 0.65) ─────┐ │ CONTEXT INSPECTOR        │
│    Last ingest: 14m ago  │ │ ▼ Q: bottleneck in static GraphRAG?│ │  Select a concept node   │
│                          │ │   A: Token amplification during …  │ │  or interest pill.       │
└──────────────────────────┴──────────────────────────────────────┴──────────────────────────┘
```

## Component tree

```
<App>                                  three-column flex shell, health-gated
├── <Sidebar>                          layout/Sidebar
│   ├── New Session button             → openSession(null, 'ask')   (⌘N)
│   ├── Manual Research button         → <ResearchLauncher> modal   (⌘K)
│   ├── <SessionList>                  GET /api/sessions
│   │   └── <SessionItem active?>
│   └── <DaemonBadge>                  GET /api/daemon/status (footer)
│
├── <MainCanvas>                       layout/MainCanvas, vertical stack
│   ├── <EventBusStream>               live job feed (WS) — pinned top
│   │   └── <JobProgressCard> / <JobStreamItem>   phase + message + bar
│   ├── <InterestDecayMatrix>          GET /api/interests — strength-bucketed
│   │   └── <InterestPill onClick>     → selects into Context Inspector
│   ├── <HighQualityDigests>           GET /api/knowledge?min_quality=0.65
│   │   └── <DigestItem collapsible>   Q/A pair
│   └── <ChatThread> | <IdeationBoard> shown when a session is active (ask vs brainstorm)
│
└── <ContextPanel>                     layout/ContextPanel
    ├── <GlobalCognitiveStats>         GET /api/stats
    ├── <KnowledgeGraph>               GET /api/graph/subgraph — React Flow
    │   └── graph node                 concept | method | model | dataset | paper
    └── <ContextInspector>             detail of the selected pill/node
        └── <CitationViewer>           GET /api/citations/{id} (paper node selected)

<OfflineScreen>                        replaces the whole shell when health ≠ ok
<ResearchLauncher>                     modal (topic + depth slider), mounted at App level
```

## Interaction model

- **Selection is the spine of the right panel.** Clicking an interest pill or graph node
  sets one "selected entity" in `uiStore`; the Context Inspector renders its detail —
  interest → evidence timeline (`/interests/{label}/timeline`), concept → relationships,
  paper → `CitationViewer`. Graph and matrix share selection state.
- **The EventBus stream is always visible** at the top of the canvas, whether the job was
  launched manually or autonomously by the daemon — both arrive as the same
  `started→progress→result` stream. Autonomous jobs appearing unprompted is the whole point
  of "proactive."
- **Sessions toggle the canvas mode.** Selecting a session swaps the Digests area for a
  `ChatThread` (ask) or `IdeationBoard` (brainstorm); the dashboards stay put.
- **Empty/offline states matter.** Backend offline → full-canvas `OfflineScreen`. No
  interests yet → "The daemon hasn't learned anything about you yet — ask something or run
  research."

---

> **Source of truth:** `src/App.tsx`, `src/components/layout/`, `src/store/uiStore.ts`.
> Tokens: [foundations.md](foundations.md).
