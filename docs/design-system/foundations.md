# Design Foundations

A dark, terminal-adjacent theme built on Tailwind's `neutral`/`stone` scales. The defining
idea: **interest strength is rendered as visual weight** — bright/full for strong interests,
dimmed as they decay toward the research-trigger threshold.

## Color tokens

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

## The interest-decay color language

Strength → visual treatment is the core idiom. The matrix should make the "about to
trigger" band (near 0.3) obvious, since that's what drives autonomous research.

| Strength | Treatment | Token |
|---|---|---|
| ≥ 0.70 | full weight, bright | `text-stone-50` |
| 0.40–0.69 | normal | `text-neutral-400` |
| 0.30–0.39 | dim (near the 0.3 trigger threshold) | `text-neutral-600` |
| < 0.30 | only when showing all; faded | `text-neutral-700 opacity-60` |

(The 0.3 threshold and the 720-hour decay half-life are backend behavior — see
`personal-assistant/docs/architecture/signal-flow.md`.)

## Typography

A **monospace** face (JetBrains Mono / system mono) for stats, job IDs, and progress —
reinforcing the "cognitive engine console" feel. UI text in the system sans.

## Accessibility & polish

- Respect `prefers-reduced-motion`: progress bars animate width, not shimmer.
- Every color-coded state also carries a text/icon label (🟢 Active) — never color alone.
- Keyboard: `⌘/Ctrl+K` opens Manual Research, `⌘/Ctrl+N` new session (wired in `App.tsx`);
  arrow keys move selection in the graph and session list.

---

> **Source of truth:** `tailwind.config.js`, `src/index.css`, `src/components/`.
> Layout: [layout.md](layout.md).
