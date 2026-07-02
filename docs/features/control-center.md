# Feature — Control Center & Daemon Logs

Operational visibility into the background engine and connectors — the input side of the
proactive loop, complementing the EventBus stream (the output side).

## Capabilities

| Capability | UI | Backend |
|---|---|---|
| Daemon status | `<DaemonBadge>` (🟢/🔴 + last ingest) | `GET /api/daemon/status` |
| Global stats | `<GlobalCognitiveStats>` | `GET /api/stats` (+ `user_stats` for total questions) |
| Activity stream | `<ActivityStream>` | `GET /api/activity?limit=` (reads `activity_log`) |

## Notes

- Stats mapping: **Total Questions** ← `user_stats.total_questions`, **Knowledge Seeds** ←
  `knowledge_entries` count, **Concepts Mapped** ← `concepts` count.
- The activity stream shows what connectors (GitHub, …) are scanning — the input side of the
  proactive loop.
- Daemon **start/stop from the UI is out of scope for MVP**: the daemon runs inside the
  backend process, so its lifecycle is the backend's job (see
  [architecture/backend-lifecycle.md](../architecture/backend-lifecycle.md)). The badge is
  read-only status.

## Refresh cadence

| Data | Source | Cadence |
|---|---|---|
| Daemon status | `GET /api/daemon/status` | 10 s |
| Activity stream | `GET /api/activity` | 15 s |
| Stats | `GET /api/stats` | 30 s **+ invalidate on any job `result`** |

---

> **Source of truth:** `src/components/control/{DaemonBadge,GlobalCognitiveStats,ActivityStream}.tsx`,
> `src/hooks/{useDaemonStatus,useStats,useActivity}.ts`. Backend:
> `personal-assistant/docs/ops/daemon.md`.
