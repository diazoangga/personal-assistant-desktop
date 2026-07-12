import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import type { MessagePayload, ProgressPayload, TraceStep } from '../api/types';

export interface JobStreamState {
  kind: string | null;
  phase: string | null;
  message: string | null;
  pct: number | null;
  messages: MessagePayload[];
  trace: TraceStep[];
  result: Record<string, any> | null;
  error: string | null;
  done: boolean;
}

const initialState: JobStreamState = {
  kind: null,
  phase: null,
  message: null,
  pct: null,
  messages: [],
  trace: [],
  result: null,
  error: null,
  done: false,
};

// Drives one job's Started→Progress→Message→Result stream over WS (SSE
// fallback). On Result, invalidates the dashboards it could have changed —
// see docs/API_INTEGRATION.md §4.
export function useJobStream(jobId: string | null) {
  const [state, setState] = useState<JobStreamState>(initialState);
  const qc = useQueryClient();
  const jobIdRef = useRef(jobId);
  jobIdRef.current = jobId;

  useEffect(() => {
    if (!jobId) {
      setState(initialState);
      return;
    }
    setState(initialState);
    let cancelled = false;

    (async () => {
      try {
        for await (const ev of api.streamJob(jobId)) {
          if (cancelled) break;
          if (ev.event_type === 'started') {
            setState((s) => ({ ...s, kind: ev.payload.kind }));
          } else if (ev.event_type === 'progress') {
            const payload = ev.payload as ProgressPayload;
            setState((s) => ({ ...s, phase: payload.phase, message: payload.message, pct: payload.pct ?? s.pct }));
          } else if (ev.event_type === 'message') {
            const payload = ev.payload as MessagePayload;
            setState((s) => ({ ...s, messages: [...s.messages, payload] }));
          } else if (ev.event_type === 'trace') {
            const step = ev.payload as TraceStep;
            setState((s) => {
              const i = s.trace.findIndex((t) => t.id === step.id);
              const trace =
                i >= 0
                  ? [...s.trace.slice(0, i), step, ...s.trace.slice(i + 1)]
                  : [...s.trace, step];
              return { ...s, trace };
            });
          } else if (ev.event_type === 'result') {
            setState((s) => ({ ...s, result: ev.payload.data, done: true }));
            qc.invalidateQueries({ queryKey: ['stats'] });
            qc.invalidateQueries({ queryKey: ['interests'] });
            qc.invalidateQueries({ queryKey: ['graph'] });
            qc.invalidateQueries({ queryKey: ['research', 'runs'] });
            qc.invalidateQueries({ queryKey: ['sessions'] });
            qc.invalidateQueries({ queryKey: ['knowledge'] });
            break;
          } else if (ev.event_type === 'error') {
            setState((s) => ({ ...s, error: ev.payload.message, done: true }));
            break;
          }
        }
      } catch (err) {
        if (!cancelled) {
          setState((s) => ({ ...s, error: err instanceof Error ? err.message : String(err), done: true }));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [jobId]);

  return state;
}
