# ADR-0003: Three-panel workspace, no routing

**Status:** Accepted · **Date:** 2026-06

## Context

This is a single-purpose operator console for one engine, not a multi-page site. The value
is seeing the engine's state **all at once** — the live job stream, the interest model, and
the knowledge graph side by side — and drilling into a selection, rather than navigating
between pages.

## Decision

A fixed **three-panel workspace** (Sidebar / Main Canvas / Context Panel) with **no router**.
Panels update in place. "Navigation" is **selection**: clicking an interest pill or a graph
node sets a single selected entity in UI state, and the Context Panel renders its detail.
Sessions toggle the canvas mode (ChatThread vs IdeationBoard) without changing route.

## Consequences

- **+** Everything important is visible simultaneously; the proactive engine's behavior is
  legible at a glance.
- **+** No route/URL state to manage or sync; the shell is trivial (`App.tsx` mounts three
  panels behind a health gate).
- **−** No deep-linking or back/forward; state isn't addressable by URL.
- **−** Doesn't scale to many distinct "pages" of functionality — if the product grows new
  top-level areas, this decision is the first to revisit.
