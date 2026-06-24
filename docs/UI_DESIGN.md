# UI Design

> The three-panel workspace, its design tokens, and component tree.
> **Last updated:** 2026-06-24

---

## 1. Reference layout

A fixed three-column workspace. No page navigation — panels update in place.

```
┌──────────────────────────────┬────────────────────────────────────────────────┬───────────────────────────┐
│  SIDEBAR  (260px)            │  MAIN CANVAS  (flex: 1)                          │  CONTEXT PANEL  (320px)   │
│  bg-neutral-900              │  bg-neutral-950                                  │  bg-neutral-900           │
│  border-r border-neutral-800 │                                                  │  border-l border-neutral-800
├──────────────────────────────┼────────────────────────────────────────────────┼───────────────────────────┤
│ [ + New Session ]            │ ┌ PROACTIVE EVENTBUS STREAM ───────────────────┐ │ GLOBAL COGNITIVE STATS    │
│ [ 🔬 Manual Research ]       │ │ 🟢 daemon.service // Job #8092 Active         │ │  Total Questions:   142   │
│                              │ │ Progress: [██████████████░░░░░] 64%           │ │  Knowledge Seeds:    89   │
│ SESSIONS                     │ │ › Fetching arXiv papers for "GraphRAG…"       │ │  Concepts Mapped:   412   │
│  • GraphRAG Routing          │ └───────────────────────────────────────────────┘ │                           │
│  • Nix Env Config            │ ┌ INTEREST DECAY MATRIX (get_strength) ─────────┐ │ KNOWLEDGE EXPLORER        │
│  • Causal Inference          │ │ (0.85) [ GraphRAG ] [ Markov Chains ]         │ │   (○) GraphRAG            │
│                              │ │ (0.55) [ Causal Inference ]                   │ │    └─(●) PageRank         │
│                              │ │ (0.31) [ Nix Environments ]                   │ │        └─(○) Paper        │
│                              │ └───────────────────────────────────────────────┘ │                           │
│                              │ ┌ HIGH-QUALITY DIGESTS (quality ≥ 0.65) ────────┐ │ CONTEXT INSPECTOR         │
│ 🟢 Daemon: Active            │ │ ▼ Q: primary bottleneck in static GraphRAG?   │ │  Select a concept node    │
│    Last ingest: 14m ago      │ │   A: Token amplification during traversals…   │ │  or interest pill to view │
│                              │ └───────────────────────────────────────────────┘ │  its evidence trail.      │
└──────────────────────────────┴────────────────────────────────────────────────┴───────────────────────────┘
```

## 2. Design tokens

A dark, terminal-adjacent theme. Tailwind `neutral`/`stone` scales.

| Token | Tailwind | Use |
|---|---|---|
| Canvas bg | `bg-neutral-950` | Main canvas background |
| Surface bg | `bg-neutral-900` | Sidebar, context panel, cards |
| Border | `border-neutral-800` | All panel/card borders |
| Text primary | `text-stone-50` | High-strength interests, headings, answers |
| Text secondary | `text-neutral-400` | Mid-strength interests, body labels |
| Text muted | `text-neutral-600` | Low-strength / decaying interests, metadata |
| Accent (live) | `text-emerald-400` / 🟢 | Active daemon, running jobs |
| Accent (action) | `bg-emerald-600` | Primary buttons (New Session, Research) |
| Warn | `text-amber-400` | Stalled jobs, daemon degraded |
| Error | `text-red-400` | Failed jobs, backend offline |

**Interest-strength → opacity/color mapping** (the "decay" visual language):

| Strength | Treatment | Token |
|---|---|---|
| ≥ 0.70 | full weight, bright | `text-stone-50` |
| 0.40–0.69 | normal | `text-neutral-400` |
| 0.30–0.39 | dim (near trigger threshold 0.3) | `text-neutral-600` |
| < 0.30 | only with `--all`; faded | `text-neutral-700 opacity-60` |

Typography: a monospace face (e.g. JetBrains Mono / system mono) for stats, job IDs, and
progress — it reinforces the "cognitive engine console" feel. UI text in the system sans.

## 3. Component tree

```
<App>                                  three-column flex shell
├── <Sidebar>                          w-260, bg-neutral-900
│   ├── <NewSessionButton>
│   ├── <ManualResearchButton>         opens <ResearchLauncher> modal
│   ├── <SessionList>                  GET /api/sessions
│   │   └── <SessionItem active?>
│   └── <DaemonBadge>                  GET /api/daemon/status (footer)
│
├── <MainCanvas>                       flex-1, bg-neutral-950, vertical stack
│   ├── <EventBusStream>               live job feed (WS) — pinned top
│   │   └── <JobProgressCard>          phase + message + progress bar
│   ├── <InterestDecayMatrix>          GET /api/interests — strength-bucketed pills
│   │   └── <InterestPill onClick>     → selects into Context Inspector
│   ├── <HighQualityDigests>           GET /api/knowledge?min_quality=0.65
│   │   └── <DigestItem collapsible>   Q/A pair
│   └── <ChatThread> | <IdeationBoard> shown when a session is active (ask vs brainstorm)
│
└── <ContextPanel>                     w-320, bg-neutral-900
    ├── <GlobalCognitiveStats>         GET /api/stats
    ├── <KnowledgeGraph>               GET /api/graph/subgraph — React Flow
    │   └── <GraphNode>                concept | method | model | dataset | paper
    └── <ContextInspector>             detail of selected pill/node
        └── <CitationViewer>           GET /api/citations/{id} (when a paper node is selected)
```

## 4. Interaction notes

- **Selection is the spine of the right panel.** Clicking an interest pill (matrix) or a
  graph node sets a single "selected entity" in UI state; the Context Inspector renders
  its detail — interest → evidence timeline (`/interests/{label}/timeline`), concept →
  relationships, paper → `CitationViewer`.
- **The EventBus stream is always visible** at the top of the canvas, whether the job was
  launched manually (Manual Research) or autonomously (daemon trigger). Both arrive as
  the same `Started→Progress→Result` stream — the daemon's jobs just appear without the
  user clicking anything, which is the whole point of "proactive."
- **Sessions toggle the canvas mode.** Selecting a session swaps the Digests area for a
  `ChatThread` (ask) or `IdeationBoard` (brainstorm). The dashboards (stream, matrix,
  stats, graph) stay put.
- **Empty/offline states matter.** Backend offline → full-canvas "Start the backend"
  card (see ARCHITECTURE §5). No interests yet → "The daemon hasn't learned anything
  about you yet — ask something or run research."

## 5. Accessibility & polish

- Respect `prefers-reduced-motion`: progress bars animate width, not shimmer, when set.
- All color-coded states also carry a text/icon label (🟢 Active), never color alone.
- Keyboard: `⌘/Ctrl+K` opens Manual Research; `⌘/Ctrl+N` new session; arrow keys move
  selection in the graph and session list.
