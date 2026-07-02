# ADR-0001: Tauri over Electron

**Status:** Accepted · **Date:** 2026-06

## Context

The Personal Assistant backend is already a separate Python process (engine + daemon + local
API). The desktop client only needs to render a WebView and talk to that API over HTTP/WS.
We do not need a bundled Node runtime in the shell.

## Decision

Use **Tauri 2.x** (Rust core + the OS's system WebView) instead of Electron. The React app
runs in the WebView; the Rust core owns the native window and tray, and can later **spawn
and supervise the backend** as a child process.

## Consequences

- **+** Much smaller binary than Electron (system WebView, no bundled Chromium/Node).
- **+** A clean place (Rust) to own backend process lifecycle when we package for
  non-developers (see [backend-lifecycle.md](../backend-lifecycle.md)).
- **−** Requires a Rust toolchain for `tauri dev`/`build` (not for `pnpm dev` in a browser),
  which is why `src-tauri` is currently uncompiled in this environment.
- **−** System-WebView differences across OSes can surface rendering quirks Electron would
  hide.
