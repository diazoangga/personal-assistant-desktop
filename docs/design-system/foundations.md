# Design Foundations — "Observatory"

The UI is an **instrument panel for a cognitive engine**: a calm reading surface embedded
in a quiet telemetry console, where the machine's thinking renders as signal. Two defining
ideas: **interest strength is visual weight** (bright/full for strong interests, dimmed as
they decay toward the 0.3 research trigger), and **color encodes the agent's behavior** —
the trace kinds form a functional spectrum, not decoration.

> Full rationale, including the self-critique against generic dark-theme defaults, lives in
> `personal-assistant/docs/DESKTOP_REDESIGN_PLAN.md` §5.1.

## Color tokens (`tailwind.config.js`)

| Token | Hex | Use |
|---|---|---|
| `ink` | `#0B0E14` | canvas — cool blue-black, not pure black |
| `slate` | `#12161F` | surface — sidebar, panels, cards |
| hairline | `rgba(255,255,255,.06)` | all separators (`border-white/[0.06]`) |
| text hi / body / meta | `#E6EAF2` / `neutral-400` / `neutral-600` | reading / body / metadata |
| `action` | `#2FD98A` (emerald-600 in-app) | primary action — reserved |
| `alert` | `#FF6B6B` | failures / offline |

### The signal spectrum (functional color)

Color communicates the kind of work in the trace timeline, graph, and worker badges — one
system across the app:

| `signal.*` | Hex | Meaning |
|---|---|---|
| agent | `#B79CFF` violet | orchestrator / sub-agent spans |
| tool | `#5CC8FF` cyan | tool calls |
| skill | `#FFC55C` amber | skills (memory, extraction, …) |
| llm | `#8A94A6` slate | LLM sub-calls |
| worker | `#4ADE9E` mint | background worker runs |

## Typography — instrument vs. reading room

| Role | Family (`font-*`) | Use |
|---|---|---|
| Display / UI | `font-sans` — Inter Tight / Geist grotesk | nav, labels, headings, chrome |
| Data / trace | `font-mono` — JetBrains Mono | job ids, spans, latencies, stats, trace |
| **Reading** | `font-serif` — Newsreader | the assistant's answers **and** the digest headline |

Rendering the assistant's answer in a serif reading column is the deliberate signature — the
machine's *readout* (mono/grotesk) and its *thinking delivered to you* (serif) are visually
distinct surfaces. (Font files fall back gracefully to system serif/mono until bundled.)

## The interest-decay color language

| Strength | Treatment |
|---|---|
| ≥ 0.70 | full weight, bright (`text-stone-50`) |
| 0.40–0.69 | normal (`text-neutral-400`) |
| 0.30–0.39 | dim — near the 0.3 trigger (`text-neutral-600`) |
| < 0.30 | faded, only when showing all |

## Signature — the trace "thought stream"

Each turn, the orchestrator's nested spans light up in their `signal.*` color as they fire
(agent → tool → llm), with latency ticks, then collapse to a summary line when settled.
Spend the boldness here; keep everything else quiet.

## Accessibility & polish

- `prefers-reduced-motion` respected (the thought stream fades rather than bounces) — see `index.css`.
- Every color-coded state also carries a glyph/label (never color alone).
- Keyboard: `⌘/Ctrl+K` Manual Research, `⌘/Ctrl+N` new chat, `⌘/Ctrl+\` toggle sidebar.

---

> **Source of truth:** `tailwind.config.js`, `src/index.css`, `src/components/`.
> Layout: [layout.md](layout.md).
