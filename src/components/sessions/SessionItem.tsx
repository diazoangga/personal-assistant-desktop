import { useState } from 'react';
import type { Session } from '../../api/types';
import { useUIStore } from '../../store/uiStore';
import { useDeleteSession } from '../../hooks/useSessions';

const kindIcon: Record<string, string> = {
  chat: '💬',
  ask: '💬',
  brainstorm: '🧠',
};

export function SessionItem({ session }: { session: Session }) {
  const activeSessionId = useUIStore((s) => s.activeSessionId);
  const openSession = useUIStore((s) => s.openSession);
  const closeSession = useUIStore((s) => s.closeSession);
  const isActive = activeSessionId === session.id;
  const del = useDeleteSession();
  const [confirming, setConfirming] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirming) {
      setConfirming(true);
      return;
    }
    del.mutate(session.id, {
      onSuccess: () => {
        if (isActive) closeSession();
      },
    });
  };

  return (
    <div
      className={`group flex items-center gap-1 rounded-md pr-1 transition-colors ${
        isActive ? 'bg-white/[0.08]' : 'hover:bg-white/[0.05]'
      }`}
    >
      <button
        onClick={() => openSession(session.id)}
        className={`flex min-w-0 flex-1 items-center gap-2 truncate px-2 py-1.5 text-left text-xs ${
          isActive ? 'text-neutral-100' : 'text-neutral-400 group-hover:text-neutral-200'
        }`}
      >
        <span className="shrink-0 text-sm">{kindIcon[session.kind] ?? '📄'}</span>
        <span className="truncate">{session.title || 'Untitled'}</span>
      </button>

      <button
        onClick={handleDelete}
        onMouseLeave={() => setConfirming(false)}
        disabled={del.isPending}
        title={confirming ? 'Click again to confirm' : 'Delete session'}
        className={`shrink-0 rounded p-1 text-xs opacity-0 transition-all group-hover:opacity-100 ${
          confirming
            ? 'bg-red-500/20 text-red-400 opacity-100'
            : 'text-neutral-600 hover:bg-white/[0.08] hover:text-red-400'
        }`}
      >
        {del.isPending ? '…' : confirming ? '✓' : <TrashIcon />}
      </button>
    </div>
  );
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 4h11M6 4V2.5h4V4M4 4l.5 9.5h7L12 4" />
    </svg>
  );
}
