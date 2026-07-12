import { useDigest } from '../../hooks/useDigest';

/** The daily briefing headline + a quick count of what's waiting. */
export function DigestPanel() {
  const { data: digest, isLoading } = useDigest();

  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="mb-1 flex items-center gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
          Daily Digest
        </span>
        {digest?.date && <span className="font-mono text-[10px] text-neutral-600">{digest.date}</span>}
      </div>
      {isLoading ? (
        <p className="text-sm text-neutral-600">Assembling briefing…</p>
      ) : (
        <>
          <p className="font-serif text-base leading-snug text-neutral-100">
            {digest?.headline ?? 'Nothing to report yet.'}
          </p>
          <p className="mt-1.5 text-xs text-neutral-500">
            {digest?.opportunities?.length ?? 0} opportunities · {digest?.top_interests?.length ?? 0}{' '}
            active interests
          </p>
        </>
      )}
    </div>
  );
}
