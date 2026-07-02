// Shapes match personal-assistant/docs/WEB_API.md (the backend contract).

export interface JobStarted {
  job_id: string;
  kind: string;
}

export type EventType = 'started' | 'progress' | 'message' | 'result' | 'error';

export interface EventUpdate {
  event_type: EventType;
  job_id: string;
  payload: Record<string, any>;
}

export interface StartedPayload {
  kind: string;
}

export interface ProgressPayload {
  phase: string;
  message: string;
  pct?: number;
}

export interface MessagePayload {
  role: string;
  text: string;
  citations?: string[];
}

export interface ResultPayload {
  ok: boolean;
  data: Record<string, any>;
}

export interface ErrorPayload {
  message: string;
}

export interface ResearchResultData {
  topic: string;
  papers_found: number;
  concepts_extracted: number;
  relationships_found: number;
  summary: string;
  elapsed_seconds: number;
}

export interface HealthStatus {
  status: string;
  version: string;
}

export interface DaemonStatus {
  running: boolean;
  pid: number | null;
  last_ingest: string | null;
}

export interface Stats {
  interests: number;
  concepts: number;
  citations: number;
  research_runs: number;
  knowledge_entries: number;
  total_questions?: number;
}

export interface Interest {
  id: string;
  label: string;
  strength: number;
  last_active: string;
}

export interface EvidenceItem {
  id: string;
  signal_type: string;
  confidence: number;
  created_at: string;
  source?: string;
}

export interface KnowledgeEntry {
  id: string;
  question: string;
  answer: string;
  quality: number;
  created_at: string;
  citations?: string[];
}

export type EntityCategory =
  | 'concept'
  | 'method'
  | 'model'
  | 'task'
  | 'dataset'
  | 'metric'
  | 'framework'
  | 'paper';

export interface GraphNode {
  id: string;
  label: string;
  category: EntityCategory;
}

export interface GraphEdge {
  source: string;
  target: string;
  relation_type: string;
  weight: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface Citation {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  arxiv_url?: string;
  linked_concepts: GraphNode[];
}

export interface ResearchRun {
  id: string;
  topic: string;
  papers_found: number;
  concepts_extracted: number;
  relationships_found: number;
  summary: string;
  elapsed_seconds: number;
  created_at: string;
}

export interface Session {
  id: string;
  title: string;
  kind: 'ask' | 'brainstorm';
  updated_at: string;
}

export interface Turn {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  citations?: string[];
  created_at: string;
}

// Audit trail: which agent/tool/skill ran for a session (GET /sessions/{id}/trace).
export interface TraceEntry {
  id: number;
  session_id: string | null;
  job_id: string | null;
  kind: 'agent' | 'tool' | 'skill' | string;
  name: string;
  status: 'ok' | 'error' | string;
  detail: string | null;
  duration_ms: number | null;
  created_at: string;
}

// Proactive recommendation synthesized by the Opportunity Agent.
export interface Opportunity {
  id: string;
  title: string;
  description: string | null;
  relevance_score: number;
  source: string | null;
  url: string | null;
  status: 'new' | 'saved' | 'dismissed' | string;
  created_at: string;
}

export interface Digest {
  date: string;
  headline: string;
  opportunities: Opportunity[];
  top_interests: Interest[];
}

export interface ActivityItem {
  id: string;
  source: string;
  message: string;
  created_at: string;
}

export type ResearchDepth = 'shallow' | 'normal' | 'deep';

export type Verdict = 'accept' | 'reject' | 'correct';
