# Desktop Redesign — what shipped

The `feat/desktop-redesign` work rebuilt the app around one idea: **make the engine's
behavior legible.** The full cross-repo plan (backend agents, workers, memory, API) is the
master doc:

> `personal-assistant/docs/DESKTOP_REDESIGN_PLAN.md`

This page is the desktop-side summary (D4 split of §5).

## Information architecture — three surfaces

`Chat · Graph · Dashboard` (the old four-tab Ask/Brainstorm split is gone).

- **Sidebar** — sessions + New Chat + Manual Research + Knowledge Graph.
- **Main canvas** — the active surface.
- **Context panel** — Stats · **Trace** · **Memory** · Opportunities · Inspector · Activity.

## Chat (the unified conversation)

One `ChatThread` posts to `POST /api/chat`, which routes through the Brainstorming
**orchestrator**; `ask`/`brainstorm` were removed. Each exchange shows, top→bottom:

1. the user message,
2. an **inline trace timeline** — the orchestrator's live nested spans (agent → tool →
   llm) in the signal spectrum, from `useJobStream().trace`,
3. the streaming **answer in a serif reading column**, with citations.

Persisted spans replay from `GET /api/sessions/{id}/trace` (`SessionTrace` + the Context
panel's Trace section).

## Graph

`KnowledgeGraph` (React Flow) with a tolerant node-color fallback; edges render now that
the backend serializes `source`/`target`.

## Dashboard

Top row = the three hero panels: **Opportunities · Research · Interests**. Below: the
**Daily Digest** headline (serif), **live activity** (interactive + worker jobs share one
stream), and **Workers** status with manual triggers.

## Memory

The Context panel's **Memory** section lists what the assistant remembers (core / fact /
rule), each forgettable — backed by `GET /api/memory` + `DELETE /api/memory/{id}`.

## Design system

The "Observatory" tokens (ink/slate ground, signal spectrum, serif reading column) live in
`tailwind.config.js` + `src/index.css`; see [../design-system/foundations.md](../design-system/foundations.md).

## Key files

- `api/{client,types}.ts` — `chat()`, `trace` event + `TraceStep`, memory, workers, digest.
- `hooks/` — `useJobStream` (nested trace), `useMemory`, `useWorkers`, `useDigest`.
- `components/trace/TraceTimeline.tsx` — the signal-colored span tree.
- `components/dashboard/*` — Dashboard, Research/Digest/Workers panels.
- `components/memory/MemoryPanel.tsx`, `components/sessions/ChatThread.tsx`.
