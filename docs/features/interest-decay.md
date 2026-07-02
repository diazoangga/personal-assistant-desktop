# Feature — Interest & Decay Dashboard

Visualizes the engine's model of the user and how it fades over time. The decay color
language is the core idiom (see [design-system/foundations.md](../design-system/foundations.md)).

## Capabilities

| Capability | UI | Backend |
|---|---|---|
| Interest matrix (sorted by strength) | `<InterestDecayMatrix>` + `<InterestPill>` | `GET /api/interests?min_strength=` |
| Decay visualization | opacity/color by strength bucket | strength from backend `get_strength` (720 h half-life) |
| Evidence drill-down | `<ContextInspector>` timeline | `GET /api/interests/{label}/timeline` |

## Notes

- Strength → visual weight is the point: bright/full for ≥ 0.7, dim near the 0.3
  research-trigger threshold. Interests crossing 0.3 are what drive autonomous research, so
  the matrix should make the "about to trigger" band obvious.
- Drill-down shows the raw `interest_signal_evidence` — which GitHub commit / which asked
  question fed this interest, with per-signal confidence and timestamp.
- A trend arrow (surging vs decaying) can be computed **client-side** from the timeline's
  recent evidence density — a presentation concern, not a backend field.

## UI states

- **Empty** — no interests yet → "The daemon hasn't learned anything about you yet."
- **Populated** — strength-bucketed pills; click selects into the Context Inspector.
- **Selected** — Inspector shows the evidence timeline for the chosen interest.

---

> **Source of truth:** `src/components/interests/`, `src/components/control/ContextInspector.tsx`,
> `src/hooks/useInterests.ts`. Backend: `personal-assistant/docs/architecture/signal-flow.md`.
