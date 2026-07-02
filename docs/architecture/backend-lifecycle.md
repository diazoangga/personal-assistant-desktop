# Backend Lifecycle & Boundaries

The product is **two processes**: this desktop app and the `personal-assistant` backend on
`127.0.0.1:8787`. This doc covers how they're started, how the app survives the backend
being down, and the security boundary between them.

## Two services, one product

| Process | Command (in `personal-assistant`) | Serves |
|---|---|---|
| **Backend (API + daemon)** | `poetry run python -m src.adapters.api` | `http://127.0.0.1:8787` + the 24/7 daemon, in one process |
| **Frontend (this app)** | `pnpm tauri dev` (or `pnpm dev` in a browser) | the desktop window |

The backend runs the engine **and** the daemon together, sharing one knowledge store — so
autonomous (daemon-triggered) and manual (user-triggered) research land in the same place
and stream through the same hub.

## Managing the two processes

Three options, in order of build effort:

| Option | How | When |
|---|---|---|
| **Manual (MVP)** | The user starts the backend themselves; the app just connects. | Now — simplest, documented in the README. |
| **Supervised** | The Rust core (`src-tauri`) spawns the backend as a child process on launch and kills it on quit, via a Tauri command. | Once packaging for non-developers. |
| **Health-gated UI** | The app polls `GET /api/health` and shows a "Backend offline — start it" screen until reachable, then connects. | Pairs with either of the above. |

The MVP is **Manual + Health-gated**: `App.tsx` calls `useHealth()`; while it errors it
renders `OfflineScreen` (retrying), and only mounts the three-panel workspace once health is
`ok`. Supervised spawn is the reason the shell is Tauri — Rust can own the child process
cleanly (M4 in the [plan](../documentation-plan.md)).

## Security & boundaries

- The API binds **loopback only** (`127.0.0.1:8787`). No remote exposure.
- Optional `LOCAL_API_TOKEN` (bearer); the client reads it from `VITE_API_TOKEN` / Tauri
  config and attaches `Authorization: Bearer`.
- The WebView CSP must allow `connect-src http://127.0.0.1:8787 ws://127.0.0.1:8787`.
- No Telegram, no `initData`, no public tunnels. Single local user (`LOCAL_API_USER`,
  default `local`).

---

> **Source of truth:** `src/App.tsx`, `src/hooks/useHealth.ts`,
> `src/components/layout/OfflineScreen.tsx`, `src-tauri/`. Backend side:
> `personal-assistant/docs/api/rest-reference.md`, `personal-assistant/docs/ops/daemon.md`.
