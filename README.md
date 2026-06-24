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

This project is **documentation-first**. Implementation follows the docs below.

| Doc | What it covers |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Tauri process model, tech stack, repo layout, state management |
| [docs/UI_DESIGN.md](docs/UI_DESIGN.md) | Three-panel layout, design tokens, component tree, the reference mockup |
| [docs/FEATURES.md](docs/FEATURES.md) | The 5 feature modules and how each maps to backend endpoints |
| [docs/API_INTEGRATION.md](docs/API_INTEGRATION.md) | The API client, auth, SSE/WS streaming, error handling |

The backend API contract is documented in the backend repo:
`personal-assistant/docs/WEB_API.md`.

## Status

📄 **Design phase.** Docs are written; scaffolding and implementation are the next step.

## Quick start (planned)

```bash
pnpm install
pnpm tauri dev        # launches the desktop window against the backend on :8787
```

Prerequisites: Node 18+, pnpm, Rust toolchain (for Tauri), and the backend running.
