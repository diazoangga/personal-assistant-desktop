# Personal Assistant — Desktop

A **Tauri** desktop client for the [Personal Assistant](../personal-assistant) cognitive
engine. It replaces the old Telegram Mini App with a native, three-panel workspace that
makes the engine's proactive behavior visible: live research jobs, a decaying interest
model, a knowledge-graph explorer, and the daemon's activity stream.

This repo contains **only the frontend**. The backend (engine + daemon + local HTTP API)
lives in the separate `personal-assistant` repo and runs as its own process.

```
┌─────────────────┐   HTTP / SSE / WS    ┌──────────────────────────────┐
│  this repo       │  ───────────────────▶│  personal-assistant backend  │
│  Tauri + React   │ ◀─────────────────── │  src/adapters/api (:8787)    │
│  (desktop app)   │   JSON + event stream│  + daemon + knowledge.db     │
└─────────────────┘                       └──────────────────────────────┘
```

## Two services, one product

Running the product means running **two processes**:

1. **Backend (daemon + API):** `poetry run python -m src.adapters.api` in the
   `personal-assistant` repo. Serves `http://127.0.0.1:8787` and runs the 24/7 daemon.
2. **Frontend (this app):** `pnpm tauri dev` here. Connects to the backend on 8787.

## Documentation (read these first)

This project is **documentation-first**. The set is organized under [docs/](docs/) and
indexed by the [Documentation Plan](docs/documentation-plan.md). Start there. Highlights:

| Area | Docs |
|---|---|
| **Architecture** | [overview](docs/architecture/overview.md) · [API client](docs/architecture/api-client.md) · [backend lifecycle](docs/architecture/backend-lifecycle.md) · [decisions](docs/architecture/decisions/) |
| **Design system** | [foundations](docs/design-system/foundations.md) · [layout & component tree](docs/design-system/layout.md) |
| **Features** | [cognitive sessions](docs/features/cognitive-sessions.md) · [live research](docs/features/live-research.md) · [interest decay](docs/features/interest-decay.md) · [knowledge graph](docs/features/knowledge-graph.md) · [control center](docs/features/control-center.md) |
| **Flows / Ops** | [manual research](docs/flows/manual-research.md) · [local dev](docs/ops/local-dev.md) |

The backend API contract is documented in the backend repo:
[`personal-assistant/docs/api/rest-reference.md`](../personal-assistant/docs/api/rest-reference.md)
and [`personal-assistant/docs/api/streaming.md`](../personal-assistant/docs/api/streaming.md).
Pre-rewrite docs are preserved under [docs/_archive/](docs/_archive/).

## Status

🛠️ **Scaffolded.** The React app (three-panel shell, API client, hooks, all 5
feature modules) and the Tauri shell config are implemented per the docs
above. Not yet verified: `src-tauri` has not been compiled (no local Rust
toolchain) — `pnpm tauri dev` is untested until that's available. The
backend's `src/adapters/api` package is also not implemented yet, so the app
currently runs in its documented "backend offline" state.

## Quick start

```bash
pnpm install
pnpm dev              # Vite dev server only, in a regular browser — no Rust needed
pnpm tauri dev         # full desktop window; requires the Rust toolchain
```

Prerequisites: Node 18+, pnpm (or `corepack enable pnpm`), Rust toolchain (for
`tauri dev`/`tauri build` only — not needed for `pnpm dev`), and the backend
running on `:8787`.
