import { useState } from 'react';
import { useJobStream } from '../../hooks/useJobStream';
import { useJobsStore } from '../../store/jobsStore';
import { api } from '../../api/client';

// Layout variant of the chat view for `brainstorm` — each streamed Message
// event renders as its own angle/hypothesis card instead of a linear
// transcript (docs/FEATURES.md Module 1).
export function IdeationBoard({ sessionId }: { sessionId: string | null }) {
  const [input, setInput] = useState('');
  const [jobId, setJobId] = useState<string | null>(null);
  const trackJob = useJobsStore((s) => s.trackJob);
  const stream = useJobStream(jobId);

  const submit = async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    const { job_id } = await api.brainstorm(text, sessionId ?? undefined);
    trackJob(job_id);
    setJobId(job_id);
  };

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex-1 overflow-y-auto">
        {!jobId && <p className="text-sm text-neutral-600">Describe a problem to brainstorm angles on.</p>}
        {jobId && !stream.messages.length && !stream.done && (
          <p className="text-sm text-neutral-600">⟳ {stream.phase ?? 'thinking'}…</p>
        )}
        <div className="grid grid-cols-2 gap-2">
          {stream.messages.map((m, i) => (
            <div key={i} className="rounded border border-neutral-800 bg-neutral-900 p-3 text-sm text-neutral-400">
              {m.text}
            </div>
          ))}
        </div>
        {stream.error && <p className="text-red-400">{stream.error}</p>}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Brainstorm…"
          className="flex-1 rounded border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-stone-50 outline-none focus:border-neutral-600"
        />
        <button type="submit" className="rounded bg-emerald-600 px-3 py-2 text-sm text-neutral-950">
          Brainstorm
        </button>
      </form>
    </div>
  );
}
