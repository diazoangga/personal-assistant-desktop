import { useEffect, useRef, useState } from 'react';
import { useSessionTurns } from '../../hooks/useSessions';
import { useJobStream } from '../../hooks/useJobStream';
import { useJobsStore } from '../../store/jobsStore';
import { useUIStore } from '../../store/uiStore';
import { api } from '../../api/client';
import { SessionTrace } from './SessionTrace';
import { TraceTimeline } from '../trace/TraceTimeline';

export function ChatThread({ sessionId }: { sessionId: string | null }) {
  const { data: turns } = useSessionTurns(sessionId);
  const [input, setInput] = useState('');
  const [pendingJobId, setPendingJobId] = useState<string | null>(null);
  const trackJob = useJobsStore((s) => s.trackJob);
  const openSession = useUIStore((s) => s.openSession);
  const stream = useJobStream(pendingJobId);
  const bottomRef = useRef<HTMLDivElement>(null);

  const liveText = stream.messages.map((m) => m.text).join('');

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns?.length, liveText]);

  const submit = async () => {
    const query = input.trim();
    if (!query) return;
    setInput('');
    // Adopt a stable session id up front. Without this, a brand-new chat has a
    // null session, so after the job completes the streamed answer is cleared
    // and the session-turns query (disabled for a null id) never shows it — the
    // reply vanishes. Opening the session enables the turns query so the
    // persisted answer renders once the job finishes.
    let sid = sessionId;
    if (!sid) {
      sid = `${crypto.randomUUID().slice(0, 8)}`;
      openSession(sid);
    }
    const { job_id } = await api.chat(query, sid);
    trackJob(job_id);
    setPendingJobId(job_id);
  };

  // Bridge the gap between "job done" and "turns refetched": keep the streamed
  // answer on screen until the persisted assistant turn actually shows up.
  const answerPersisted =
    !!liveText && !!turns?.some((t) => t.role === 'assistant' && t.text === liveText);
  const showSettledAnswer = stream.done && !stream.error && !!liveText && !answerPersisted;

  const isEmpty = !turns?.length && !pendingJobId;

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Messages */}
      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-4 space-y-4">
        {isEmpty && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mb-2 text-2xl">💬</div>
              <p className="text-sm text-neutral-500">Ask anything to start this session.</p>
              <p className="mt-1 text-xs text-neutral-700">Your knowledge base and research are available.</p>
            </div>
          </div>
        )}

        {turns?.map((turn) => (
          <div
            key={turn.id}
            className={`flex gap-3 ${turn.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div
              className={`h-6 w-6 shrink-0 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${
                turn.role === 'user'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              {turn.role === 'user' ? 'U' : 'AI'}
            </div>
            <div
              className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                turn.role === 'user'
                  ? 'bg-emerald-600/20 text-neutral-100 rounded-tr-sm'
                  : 'bg-white/[0.04] text-neutral-200 rounded-tl-sm'
              }`}
            >
              {turn.text}
            </div>
          </div>
        ))}

        {pendingJobId && (!stream.done || showSettledAnswer) && (
          <div className="flex gap-3">
            <div className="h-6 w-6 shrink-0 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-400 mt-0.5">
              AI
            </div>
            <div className="max-w-[80%] min-w-0 space-y-2">
              {stream.trace.length > 0 && (
                <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                  <TraceTimeline steps={stream.trace} />
                </div>
              )}
              <div className="rounded-xl rounded-tl-sm bg-white/[0.04] px-3.5 py-2.5 text-sm text-neutral-200 leading-relaxed">
                {liveText || (
                  <span className="flex items-center gap-1.5 text-neutral-500">
                    <span className="inline-flex gap-1">
                      <span className="animate-bounce h-1 w-1 rounded-full bg-neutral-500" style={{ animationDelay: '0ms' }} />
                      <span className="animate-bounce h-1 w-1 rounded-full bg-neutral-500" style={{ animationDelay: '150ms' }} />
                      <span className="animate-bounce h-1 w-1 rounded-full bg-neutral-500" style={{ animationDelay: '300ms' }} />
                    </span>
                    {stream.phase ?? 'thinking'}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {pendingJobId && stream.error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">
            {stream.error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <SessionTrace sessionId={sessionId} />

      {/* Input */}
      <form
        onSubmit={(e) => { e.preventDefault(); submit(); }}
        className="flex gap-2 border-t border-white/[0.06] bg-[#0d0d0f] px-2 py-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question…"
          className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-neutral-100 placeholder-neutral-600 outline-none focus:border-emerald-600/50 focus:bg-white/[0.06] transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}
