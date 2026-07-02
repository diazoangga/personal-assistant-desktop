# Local Development

The product is **two processes**. Run the backend first, then this app.

## Prerequisites

- Node 18+, **pnpm** (`corepack enable pnpm`)
- The **backend** (`personal-assistant`) running on `:8787`
- Rust toolchain — **only** for `pnpm tauri dev` / `tauri build` (not for `pnpm dev`)

## Run

```bash
pnpm install

# Option A — browser dev (no Rust needed): fastest inner loop
pnpm dev            # Vite dev server (http://localhost:1420)

# Option B — full desktop window (requires Rust toolchain)
pnpm tauri dev
```

Start the backend in the other repo first:

```bash
# in D:/personal-assistant
poetry run python -m src.adapters.api      # serves 127.0.0.1:8787
```

If the backend isn't up, the app shows the **OfflineScreen** and retries `GET /api/health`
until it connects (see [architecture/backend-lifecycle.md](../architecture/backend-lifecycle.md)).

## Configuration

| Env var | Default | Purpose |
|---|---|---|
| `VITE_API_URL` | `http://127.0.0.1:8787` | backend base URL (WS URL derived by swapping `http`→`ws`) |
| `VITE_API_TOKEN` | — | bearer, only if the backend sets `LOCAL_API_TOKEN` |

Set these in `.env` (see `.env.example`).

## Build

```bash
pnpm build          # tsc -b && vite build
pnpm tauri build    # packaged desktop binary (requires Rust)
```

## Status

Scaffolded: the React app (shell, client, hooks, all 5 feature modules) and the Tauri shell
config are implemented per these docs. `src-tauri` has not been compiled here (no local Rust
toolchain), so `pnpm tauri dev` is untested; `pnpm dev` in a browser works against a running
backend.

---

> **Source of truth:** `package.json`, `vite.config.ts`, `.env.example`, `src-tauri/tauri.conf.json`.
