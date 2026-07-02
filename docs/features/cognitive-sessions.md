# Feature — Cognitive Sessions (ask & brainstorm)

A unified chat workspace over the engine's conversational paths, backed by the backend's
`conversation_sessions` / `conversation_turns`.

## Capabilities

| Capability | UI | Backend |
|---|---|---|
| List / switch sessions | `<SessionList>` in sidebar | `GET /api/sessions` |
| Replay a thread | `<ChatThread>` | `GET /api/sessions/{id}/turns` |
| New session | New Session button (⌘N) | created lazily on first message (`session_id` omitted) |
| **Ask** (cited Q&A) | `<ChatThread>` input → answer | `POST /api/ask` → job → stream `message` + `result` |
| **Brainstorm** (ideation) | `<IdeationBoard>` (angles/hypotheses) | `POST /api/brainstorm` → job → stream |
| Quality notebook | `<HighQualityDigests>` | `GET /api/knowledge?min_quality=0.65` |

## Notes

- `ask` and `brainstorm` return a `job_id`; the answer arrives as a `message` event then a
  terminal `result`. The same `useJobStream` hook drives both (see
  [architecture/api-client.md](../architecture/api-client.md)).
- The **Ideation Board** is a layout variant of the chat view, not a separate engine
  feature — it presents the LLM's output as discrete angle/hypothesis cards rather than a
  linear transcript. Which view shows depends on the session mode (`ask` vs `brainstorm`).
- The quality notebook surfaces only Q&A the engine **auto-saved** (quality ≥ 0.65) — a
  curated "best insights" view, not raw history.

## UI states

- **Loading** — session list/turns resolving.
- **Empty** — no sessions yet → New Session CTA.
- **Streaming** — answer building token-by-token via `message` events.
- **Error** — `result.ok === false` or `error` event → inline error in the thread.

---

> **Source of truth:** `src/components/sessions/`, `src/components/knowledge/HighQualityDigests.tsx`,
> `src/hooks/useSessions.ts`, `src/hooks/useKnowledge.ts`. Backend:
> `personal-assistant/docs/agents/brainstorming.md`.
