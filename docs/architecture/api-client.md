# API Client

How the desktop app talks to the backend: the client, the streamed event envelope, the
`useJobStream` hook, and the TanStack Query read patterns. The authoritative endpoint
contract lives in `personal-assistant/docs/api/`
([rest-reference](../../../personal-assistant/docs/api/rest-reference.md),
[streaming](../../../personal-assistant/docs/api/streaming.md)).

## Base configuration

The backend serves `http://127.0.0.1:8787` (loopback). Base URL comes from config so dev
and packaged builds can differ:

```ts
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8787';
const WS_URL   = BASE_URL.replace(/^http/, 'ws');
const API_TOKEN = import.meta.env.VITE_API_TOKEN;   // optional bearer
```

If the backend sets `LOCAL_API_TOKEN`, the client attaches
`Authorization: Bearer <token>` to every request. There is **no Telegram `initData`** — the
single user is `local`, stamped server-side.

## Client shape (`api/client.ts`)

`PersonalAssistantAPI` (an axios instance over `${BASE_URL}/api`) has two method families:

```ts
class PersonalAssistantAPI {
  // ── command path: returns a job to stream ──
  ask(query, sessionId?): Promise<JobStarted>;
  brainstorm(text, sessionId?): Promise<JobStarted>;
  research(topic, depth?: number | 'shallow'|'normal'|'deep'): Promise<JobStarted>;
  feedback(ref, verdict, note?): Promise<JobStarted>;

  // ── query path: synchronous dashboard reads ──
  health(); daemonStatus(); stats(); interests(minStrength?);
  interestTimeline(label, limit?); knowledge(minQuality?, limit?);
  subgraph(topic, depth?); citation(id); researchRuns(topic?, limit?);
  sessions(limit?); sessionTurns(id); activity(limit?);

  // ── streaming ──
  streamJob(jobId): AsyncGenerator<EventUpdate>;   // WS, SSE fallback
}
```

`JobStarted = { job_id: string; kind: string }`.

## The event envelope

Every streamed event shares one envelope:

```ts
interface EventUpdate {
  event_type: 'started' | 'progress' | 'message' | 'result' | 'error';
  job_id: string;
  payload: Record<string, any>;
}
```

| `event_type` | `payload` |
|---|---|
| `started` | `{ kind }` |
| `progress` | `{ phase, message, pct? }` |
| `message` | `{ role, text, citations[] }` |
| `result` | `{ ok, ... }` — **terminal**; stream closes after this |
| `error` | `{ message }` |

## `useJobStream` — one job's lifecycle

WebSocket preferred, SSE fallback. The hook surfaces progress + the terminal result and —
crucially — **invalidates the affected Query caches on `result`** so the dashboards reflect
what the job produced:

```ts
for await (const ev of api.streamJob(jobId)) {
  if (ev.event_type === 'progress') { setPhase(ev.payload.phase); setPct(ev.payload.pct); }
  if (ev.event_type === 'message')  setMessages(m => [...m, ev.payload.text]);
  if (ev.event_type === 'result') {
    setResult(ev.payload);
    qc.invalidateQueries({ queryKey: ['stats'] });
    qc.invalidateQueries({ queryKey: ['interests'] });
    qc.invalidateQueries({ queryKey: ['graph'] });
    qc.invalidateQueries({ queryKey: ['research', 'runs'] });
    break;
  }
}
```

Because the backend's `EventHub` buffers from job creation, the hook can subscribe any time
after the POST returns and still replay the full history then follow live.

## Dashboard reads (TanStack Query)

```ts
useStats        = ()      => useQuery({ queryKey:['stats'],        queryFn:()=>api.stats(),        refetchInterval:30_000 });
useInterests    = (m=0.3) => useQuery({ queryKey:['interests',m], queryFn:()=>api.interests(m),   refetchInterval:30_000 });
useDaemonStatus = ()      => useQuery({ queryKey:['daemon'],       queryFn:()=>api.daemonStatus(), refetchInterval:10_000 });
useActivity     = ()      => useQuery({ queryKey:['activity'],     queryFn:()=>api.activity(50),   refetchInterval:15_000 });
```

| Data | Cadence |
|---|---|
| Job progress | WS push (real-time) |
| Daemon status | 10 s |
| Activity stream | 15 s |
| Stats / interests / graph | 30 s **+ invalidate on any job `result`** |
| Sessions / knowledge | on demand + invalidate on `result` |

## Error & offline handling

- **Backend offline** — `health()` throws (connection refused); `App.tsx` renders
  `OfflineScreen` and retries `health()` until it succeeds, then mounts the workspace.
- **Job error** — an `error` event or `result.ok === false` renders the JobProgressCard in
  an error state; no cache invalidation.
- **WS drop mid-job** — fall back to SSE (`GET /api/events/{job_id}`); if the job already
  finished, reconcile from `GET /api/research/runs`.
- **CSP** — the Tauri WebView CSP must allow
  `connect-src http://127.0.0.1:8787 ws://127.0.0.1:8787`.

---

> **Source of truth:** `src/api/client.ts`, `src/api/types.ts`, `src/hooks/useJobStream.ts`,
> `src/hooks/*`.
