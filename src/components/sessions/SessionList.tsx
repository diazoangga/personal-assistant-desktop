import { useSessions } from '../../hooks/useSessions';
import { SessionItem } from './SessionItem';

export function SessionList() {
  const { data: sessions, isLoading } = useSessions();

  return (
    <div className="flex flex-col gap-0.5">
      <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-neutral-600">
        Sessions
      </p>
      {isLoading && (
        <p className="px-2 text-xs text-neutral-600">Loading…</p>
      )}
      {!isLoading && sessions?.length === 0 && (
        <p className="px-2 text-xs text-neutral-600">No sessions yet.</p>
      )}
      {sessions?.map((session) => (
        <SessionItem key={session.id} session={session} />
      ))}
    </div>
  );
}
