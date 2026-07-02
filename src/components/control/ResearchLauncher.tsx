import { useState } from 'react';
import { useUIStore } from '../../store/uiStore';
import { useJobsStore } from '../../store/jobsStore';
import { api } from '../../api/client';

const DEPTH_LABELS = ['shallow', 'shallow', 'normal', 'deep', 'deep'];

export function ResearchLauncher() {
  const open = useUIStore((s) => s.researchLauncherOpen);
  const close = useUIStore((s) => s.closeResearchLauncher);
  const trackJob = useJobsStore((s) => s.trackJob);
  const [topic, setTopic] = useState('');
  const [depth, setDepth] = useState(3);

  if (!open) return null;

  const submit = async () => {
    if (!topic.trim()) return;
    const { job_id } = await api.research(topic.trim(), depth);
    trackJob(job_id);
    setTopic('');
    close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="w-96 rounded border border-neutral-800 bg-neutral-900 p-4"
      >
        <h2 className="mb-3 font-mono text-sm uppercase text-neutral-400">Manual Research</h2>
        <input
          autoFocus
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Research topic…"
          className="w-full rounded border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-stone-50 outline-none focus:border-neutral-600"
        />
        <div className="mt-3">
          <label className="flex justify-between font-mono text-xs text-neutral-600">
            <span>Depth</span>
            <span>{DEPTH_LABELS[depth - 1]}</span>
          </label>
          <input
            type="range"
            min={1}
            max={5}
            value={depth}
            onChange={(e) => setDepth(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={close} className="rounded px-3 py-1.5 text-sm text-neutral-400">
            Cancel
          </button>
          <button type="submit" className="rounded bg-emerald-600 px-3 py-1.5 text-sm text-neutral-950">
            Research
          </button>
        </div>
      </form>
    </div>
  );
}
