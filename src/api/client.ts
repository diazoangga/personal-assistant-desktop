/**
 * API client for the Personal Assistant desktop app.
 *
 * Ported from the old Telegram Mini App's `client.ts`: same EventUpdate/
 * JobStarted shapes and WS/SSE streaming pattern, minus setInitData/
 * authenticate/the X-Telegram-Init-Data header (see docs/API_INTEGRATION.md §7).
 * Adds the synchronous dashboard reads that didn't exist in the Telegram adapter.
 */
import axios, { AxiosInstance } from 'axios';
import type {
  ActivityItem,
  Citation,
  DaemonStatus,
  Digest,
  EvidenceItem,
  EventUpdate,
  GraphData,
  HealthStatus,
  JobStarted,
  KnowledgeEntry,
  Opportunity,
  ResearchDepth,
  ResearchRun,
  Session,
  Stats,
  Interest,
  TraceStep,
  Turn,
  Verdict,
} from './types';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8787';
const WS_URL = BASE_URL.replace(/^http/, 'ws');
const API_TOKEN = import.meta.env.VITE_API_TOKEN;

export class PersonalAssistantAPI {
  private client: AxiosInstance;

  constructor(private baseURL: string = BASE_URL, private wsURL: string = WS_URL) {
    this.client = axios.create({
      baseURL: `${this.baseURL}/api`,
      headers: API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : undefined,
    });
  }

  // ── command path: returns a job to stream ──

  async ask(query: string, sessionId?: string): Promise<JobStarted> {
    const { data } = await this.client.post('/ask', { query, session_id: sessionId });
    return data;
  }

  async brainstorm(text: string, sessionId?: string): Promise<JobStarted> {
    const { data } = await this.client.post('/brainstorm', { text, session_id: sessionId });
    return data;
  }

  async research(topic: string, depth: number | ResearchDepth = 'normal'): Promise<JobStarted> {
    const { data } = await this.client.post('/research', { topic, depth });
    return data;
  }

  async feedback(ref: string, verdict: Verdict, note?: string): Promise<JobStarted> {
    const { data } = await this.client.post('/feedback', { ref, verdict, note });
    return data;
  }

  // ── query path: synchronous dashboard reads ──

  async health(): Promise<HealthStatus> {
    const { data } = await this.client.get('/health');
    return data;
  }

  async daemonStatus(): Promise<DaemonStatus> {
    const { data } = await this.client.get('/daemon/status');
    return data;
  }

  async stats(): Promise<Stats> {
    const { data } = await this.client.get('/stats');
    return data;
  }

  async interests(minStrength = 0.0): Promise<Interest[]> {
    const { data } = await this.client.get('/interests', { params: { min_strength: minStrength } });
    return data;
  }

  async interestTimeline(label: string, limit = 50): Promise<EvidenceItem[]> {
    const { data } = await this.client.get(`/interests/${encodeURIComponent(label)}/timeline`, {
      params: { limit },
    });
    return data;
  }

  async knowledge(minQuality = 0.65, limit = 50): Promise<KnowledgeEntry[]> {
    const { data } = await this.client.get('/knowledge', { params: { min_quality: minQuality, limit } });
    return data;
  }

  async searchKnowledge(q: string, limit = 20): Promise<KnowledgeEntry[]> {
    const { data } = await this.client.get('/knowledge/search', { params: { q, limit } });
    return data;
  }

  async subgraph(topic: string, depth = 2): Promise<GraphData> {
    // Omit topic when empty so the backend returns the overall top-concepts graph.
    const params: Record<string, string | number> = { depth };
    if (topic) params.topic = topic;
    const { data } = await this.client.get('/graph/subgraph', { params });
    return data;
  }

  async citation(id: string): Promise<Citation> {
    const { data } = await this.client.get(`/citations/${encodeURIComponent(id)}`);
    return data;
  }

  async researchRuns(topic?: string, limit = 20): Promise<ResearchRun[]> {
    const { data } = await this.client.get('/research/runs', { params: { topic, limit } });
    return data;
  }

  async sessions(limit = 50): Promise<Session[]> {
    const { data } = await this.client.get('/sessions', { params: { limit } });
    return data;
  }

  async sessionTurns(id: string): Promise<Turn[]> {
    const { data } = await this.client.get(`/sessions/${encodeURIComponent(id)}/turns`);
    return data;
  }

  async sessionTrace(id: string): Promise<TraceStep[]> {
    const { data } = await this.client.get(`/sessions/${encodeURIComponent(id)}/trace`);
    return data;
  }

  async deleteSession(id: string): Promise<{ session_id: string; knowledge_entries_deleted: number }> {
    const { data } = await this.client.delete(`/sessions/${encodeURIComponent(id)}`);
    return data;
  }

  // ── opportunities (proactive recommendations) ──

  async opportunities(status?: string): Promise<Opportunity[]> {
    const { data } = await this.client.get('/opportunities', { params: status ? { status } : {} });
    return data;
  }

  async synthesizeOpportunities(): Promise<JobStarted> {
    const { data } = await this.client.post('/opportunities/synthesize');
    return data;
  }

  async updateOpportunity(id: string, action: 'save' | 'dismiss'): Promise<void> {
    await this.client.post(`/opportunities/${encodeURIComponent(id)}/${action}`);
  }

  async digest(date?: string): Promise<Digest> {
    const { data } = await this.client.get('/digest', { params: date ? { date } : {} });
    return data;
  }

  async activity(limit = 50): Promise<ActivityItem[]> {
    const { data } = await this.client.get('/activity', { params: { limit } });
    return data;
  }

  // ── streaming: WebSocket preferred, SSE fallback (docs/API_INTEGRATION.md §4, §6) ──

  async *streamJob(jobId: string): AsyncGenerator<EventUpdate> {
    try {
      yield* this.streamViaWebSocket(jobId);
    } catch {
      yield* this.streamViaSSE(jobId);
    }
  }

  private async *streamViaWebSocket(jobId: string): AsyncGenerator<EventUpdate> {
    const ws = new WebSocket(`${this.wsURL}/api/ws/events/${jobId}`);
    const queue: EventUpdate[] = [];
    let pending: ((value: void) => void) | null = null;
    let closed = false;
    let openFailed = false;

    ws.addEventListener('open', () => {});
    ws.addEventListener('message', (event) => {
      queue.push(JSON.parse(event.data));
      pending?.();
      pending = null;
    });
    ws.addEventListener('error', () => {
      if (ws.readyState !== WebSocket.OPEN) openFailed = true;
    });
    ws.addEventListener('close', () => {
      closed = true;
      pending?.();
      pending = null;
    });

    try {
      while (true) {
        while (queue.length === 0 && !closed) {
          await new Promise<void>((resolve) => {
            pending = resolve;
          });
        }
        while (queue.length > 0) {
          const ev = queue.shift()!;
          yield ev;
          if (ev.event_type === 'result' || ev.event_type === 'error') return;
        }
        if (closed) {
          if (openFailed) throw new Error('WebSocket failed to open');
          return; // closed cleanly without a terminal event — nothing more to stream
        }
      }
    } finally {
      ws.close();
    }
  }

  private async *streamViaSSE(jobId: string): AsyncGenerator<EventUpdate> {
    const source = new EventSource(`${this.baseURL}/api/events/${jobId}`);
    const queue: EventUpdate[] = [];
    let pending: ((value: void) => void) | null = null;
    let closed = false;

    source.addEventListener('message', (event) => {
      queue.push(JSON.parse((event as MessageEvent).data));
      pending?.();
      pending = null;
    });
    source.addEventListener('error', () => {
      closed = true;
      pending?.();
      pending = null;
    });

    try {
      while (true) {
        while (queue.length === 0 && !closed) {
          await new Promise<void>((resolve) => {
            pending = resolve;
          });
        }
        while (queue.length > 0) {
          const ev = queue.shift()!;
          yield ev;
          if (ev.event_type === 'result' || ev.event_type === 'error') return;
        }
        if (closed) return;
      }
    } finally {
      source.close();
    }
  }
}

export const api = new PersonalAssistantAPI();
