# Feature Modules

> The 5 feature modules, each mapped to concrete backend endpoints and UI components.
> Endpoint contracts live in `personal-assistant/docs/WEB_API.md`.
> **Last updated:** 2026-06-24

---

## Module 1 — Cognitive Sessions (`ask` & `brainstorm`)

A unified chat workspace over the engine's conversational paths, backed by
`conversation_sessions` / `conversation_turns`.

| Capability | UI | Backend |
|---|---|---|
| List / switch sessions | `<SessionList>` in sidebar | `GET /api/sessions` |
| Replay a thread | `<ChatThread>` | `GET /api/sessions/{id}/turns` |
| New session | `<NewSessionButton>` | created lazily on first message (`session_id` omitted) |
| **Ask** (cited Q&A) | `<ChatThread>` input → answer | `POST /api/ask` → job → stream `Message`/`Result` |
| **Brainstorm** (ideation) | `<IdeationBoard>` (angles/hypotheses layout) | `POST /api/brainstorm` → job → stream |
| Quality notebook | `<HighQualityDigests>` | `GET /api/knowledge?min_quality=0.65` |

Notes:
- `ask` and `brainstorm` return a `job_id`; the answer arrives as a `Message` event then a
  `Result`. The same `useJobStream` hook drives both (see API_INTEGRATION).
- The **Ideation Board** is a layout variant of the chat view, not a separate engine
  feature — it presents the LLM's output as discrete angles/hypotheses cards rather than a
  linear transcript.
- The quality notebook surfaces only Q&A the engine auto-saved (passed
  `quality_threshold ≥ 0.65`), so it's a curated "best insights" view, not raw history.

---

## Module 2 — Live Research & Job Tracker (`research`)

The most "alive" part of the UI: launch research and watch it execute in real time.

| Capability | UI | Backend |
|---|---|---|
| Launch research | `<ResearchLauncher>` modal (topic + depth slider 1–5) | `POST /api/research { topic, depth }` |
| Live progress | `<EventBusStream>` / `<JobProgressCard>` | `WS /api/ws/events/{job_id}` (SSE fallback) |
| Completed run logs | `<EventBusStream>` history + research log list | `GET /api/research/runs` |

Notes:
- The depth slider maps 1–5 → the backend's `shallow|normal|deep` (1–2 / 3 / 4–5).
- Progress phases stream as `Progress` events: e.g. *"Fetching arXiv papers…"*,
  *"Extracting concept entities…"*, with an optional `pct` for the bar.
- The `Result` payload (`papers_found`, `concepts_extracted`, `relationships_found`,
  `summary`, `elapsed_seconds`) becomes the run's log card and triggers a refresh of the
  stats / interests / graph panels.
- **Autonomous research** (daemon-triggered) shows up in the *same* stream — the user
  didn't launch it, which visibly demonstrates the proactive engine.

---

## Module 3 — Interest & Decay Dashboard (`interests`)

Visualizes the engine's model of the user and how it fades over time.

| Capability | UI | Backend |
|---|---|---|
| Interest matrix (sorted by strength) | `<InterestDecayMatrix>` + `<InterestPill>` | `GET /api/interests?min_strength=` |
| Decay visualization | opacity/color by strength bucket (UI_DESIGN §2) | strength from `get_strength` (720h half-life) |
| Evidence drill-down | `<ContextInspector>` timeline | `GET /api/interests/{label}/timeline` |

Notes:
- Strength → visual weight is the core idiom: bright/full for ≥0.7, dim near the 0.3
  research-trigger threshold. Interests crossing 0.3 are what drive autonomous research,
  so the matrix should make the "about to trigger" band obvious.
- Drill-down shows the raw `interest_signal_evidence` (which GitHub commit / which asked
  question fed this interest, with per-signal confidence and timestamp).
- Optionally annotate pills with a trend arrow (surging vs decaying) by comparing recent
  evidence density — a presentation concern, computed client-side from the timeline.

---

## Module 4 — Knowledge Graph Explorer (`ShowGraph`)

Interactive node-link view of the concept/citation graph.

| Capability | UI | Backend |
|---|---|---|
| Network visualization | `<KnowledgeGraph>` (React Flow) | `GET /api/graph/subgraph?topic=&depth=2` |
| Entity type differentiation | node color/shape by `category` | `category`: concept/method/model/task/dataset/metric/framework |
| Typed links | edge labels | `relation_type` + `weight` from `concept_relationships` |
| Citation viewer | `<CitationViewer>` on paper-node click | `GET /api/citations/{id}` (abstract, authors, arXiv link, linked concepts) |

Notes:
- `relevant_subgraphs` accepts a topic label (resolved via `find_concepts_by_label`) and
  does bidirectional BFS to `max_depth` — wire the depth to a small control.
- Selecting a node populates the Context Inspector; paper nodes open the
  `<CitationViewer>` with metadata from the `citations` table and its connected concepts.
- Graph and matrix share selection state, so clicking a concept node can also highlight
  the originating interest pill, and vice versa.

---

## Module 5 — Control Center & Daemon Logs

Operational visibility into the background engine and connectors.

| Capability | UI | Backend |
|---|---|---|
| Daemon status | `<DaemonBadge>` (🟢/🔴 + last ingest) | `GET /api/daemon/status` |
| Global stats | `<GlobalCognitiveStats>` | `GET /api/stats` (+ `user_stats` for total questions) |
| Activity stream | `<ActivityStream>` | `GET /api/activity?limit=` (reads `activity_log`) |

Notes:
- Stats panel maps: **Total Questions** ← `user_stats.total_questions`, **Knowledge
  Seeds** ← `knowledge_entries` count, **Concepts Mapped** ← `concepts` count.
- The activity stream shows what connectors (GitHub, …) are scanning — the input side of
  the proactive loop, complementing the EventBus stream (the output side).
- Daemon start/stop from the UI is **out of scope for MVP** (the daemon runs inside the
  backend process; lifecycle is the backend's job — see ARCHITECTURE §5). The badge is
  read-only status for now.

---

## Refresh cadence (polling)

Dashboards use TanStack Query polling; streams use WS push. Suggested intervals:

| Data | Source | Cadence |
|---|---|---|
| Job progress | WS push | real-time |
| Daemon status | `GET /api/daemon/status` | 10 s |
| Activity stream | `GET /api/activity` | 15 s |
| Stats / interests / graph | `GET /api/stats` etc. | 30 s **+ invalidate on any job `Result`** |
| Sessions / knowledge | on demand + invalidate on `Result` | — |
