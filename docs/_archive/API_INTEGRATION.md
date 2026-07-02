# API Integration

> How the desktop app talks to the backend: client, auth, streaming, errors.
> Authoritative endpoint contract: `personal-assistant/docs/WEB_API.md`.
> **Last updated:** 2026-06-24

---

## 1. Base configuration

The backend serves `http://127.0.0.1:8787` (loopback). The client base URL comes from
config so dev and packaged builds can differ:

```ts
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8787';
const WS_URL   = BASE_URL.replace(/^http/, 'ws');
```

If `LOCAL_API_TOKEN` is set on the backend, attach it to every request:

```ts
headers: { Authorization: `Bearer ${token}` }   // token from Tauri config / env
```

There is **no Telegram `initData`** and no `X-Telegram-Init-Data` header — that whole
auth path is gone. The single user is `local` (stamped server-side).

## 2. Client shape

Port the old Mini App `client.ts`, dropping `setInitData`/`authenticate` and adding the
synchronous dashboard reads. Two method families:

```ts
class PersonalAssistantAPI {
  // ── command path: returns a job to stream ──
  ask(query: string, sessionId?: string): Promise<JobStarted>;
  brainstorm(text: string, sessionId?: string): Promise<JobStarted>;
  research(topic: string, depth?: number | 'shallow' | 'normal' | 'deep'): Promise<JobStarted>;
  feedback(ref: string, verdict: 'accept'|'reject'|'correct', note?: string): Promise<JobStarted>;

  // ── query path: synchronous dashboard reads ──
  health(): Promise<{ status: string; version: string }>;
  daemonStatus(): Promise<{ running: boolean; pid: number | null; last_ingest: string | null }>;
  stats(): Promise<Stats>;
  interests(minStrength?: number): Promise<Interest[]>;
  interestTimeline(label: string, limit?: number): Promise<EvidenceItem[]>;
  knowledge(minQuality?: number, limit?: number): Promise<KnowledgeEntry[]>;
  subgraph(topic: string, depth?: number): Promise<GraphData>;
  citation(id: string): Promise<Citation>;
  researchRuns(topic?: string, limit?: number): Promise<ResearchRun[]>;
  sessions(limit?: number): Promise<Session[]>;
  sessionTurns(id: string): Promise<Turn[]>;
  activity(limit?: number): Promise<ActivityItem[]>;

  // ── streaming ──
  streamJob(jobId: string): AsyncGenerator<EventUpdate>;  // WS, SSE fallback
}
```

`JobStarted = { job_id: string; kind: string }`.

## 3. The event envelope

Every streamed event shares one envelope (unchanged from the Telegram adapter, so the
parsing is a straight port):

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
| `result` | `{ ok, data }` — **terminal**; stream closes after this |
| `error` | `{ message }` |

## 4. Streaming with `useJobStream`

WebSocket is preferred; fall back to SSE if the socket fails to open. The hook owns one
job's lifecycle and surfaces progress + the terminal result to React:

```ts
function useJobStream(jobId: string | null) {
  const [phase, setPhase] = useState<string>();
  const [pct, setPct] = useState<number>();
  const [messages, setMessages] = useState<string[]>([]);
  const [result, setResult] = useState<Record<string, any> | null>(null);
  const qc = useQueryClient();

  useEffect(() => {
    if (!jobId) return;
    let cancelled = false;
    (async () => {
      for await (const ev of api.streamJob(jobId)) {
        if (cancelled) break;
        if (ev.event_type === 'progress') { setPhase(ev.payload.phase); setPct(ev.payload.pct); }
        if (ev.event_type === 'message')  setMessages(m => [...m, ev.payload.text]);
        if (ev.event_type === 'result') {
          setResult(ev.payload.data);
          // a finished job changes the world → refresh dashboards
          qc.invalidateQueries({ queryKey: ['stats'] });
          qc.invalidateQueries({ queryKey: ['interests'] });
          qc.invalidateQueries({ queryKey: ['graph'] });
          qc.invalidateQueries({ queryKey: ['research', 'runs'] });
          break;
        }
      }
    })();
    return () => { cancelled = true; };
  }, [jobId]);

  return { phase, pct, messages, result };
}
```

Key point: **on `Result`, invalidate the affected Query caches** so the Interest Matrix,
Stats, and Graph reflect what the job just produced.

## 5. Dashboard reads with TanStack Query

```ts
export const useStats        = () => useQuery({ queryKey: ['stats'],        queryFn: () => api.stats(),               refetchInterval: 30_000 });
export const useInterests    = (m=0.3) => useQuery({ queryKey: ['interests', m], queryFn: () => api.interests(m),    refetchInterval: 30_000 });
export const useDaemonStatus = () => useQuery({ queryKey: ['daemon'],       queryFn: () => api.daemonStatus(),        refetchInterval: 10_000 });
export const useActivity     = () => useQuery({ queryKey: ['activity'],     queryFn: () => api.activity(50),          refetchInterval: 15_000 });
```

See [FEATURES.md](FEATURES.md) §refresh cadence for the full table.

## 6. Error & offline handling

- **Backend offline:** `health()` / any read throws (connection refused). The app shows
  the full-canvas "Start the backend" state (ARCHITECTURE §5) and retries `health()` on a
  short interval until it succeeds, then mounts the workspace.
- **Job error:** an `error` event or `result.ok === false` renders the JobProgressCard in
  an error state with the message; no cache invalidation.
- **WS drop mid-job:** fall back to reconnect via SSE (`GET /api/events/{job_id}`); if the
  job already finished, a fresh subscribe yields nothing — reconcile from
  `GET /api/research/runs`.
- **CSP:** the Tauri WebView CSP must include
  `connect-src http://127.0.0.1:8787 ws://127.0.0.1:8787` or every request is blocked.

## 7. What changed vs. the Telegram Mini App client

| Old (Telegram) | New (desktop) |
|---|---|
| `setInitData()` + `POST /api/auth` | removed — loopback + optional bearer |
| `X-Telegram-Init-Data` header | removed |
| `window.Telegram.WebApp` bootstrap | removed — app mounts directly after `health()` |
| only command POSTs + event stream | **+ synchronous dashboard GETs** (stats/interests/graph/…) |
| base `http://localhost:8000` | base `http://127.0.0.1:8787` |
