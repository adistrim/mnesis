import { Skeleton } from '@/components/ui/skeleton';

const TURNS = [
  { user: 'w-40', lines: ['w-full', 'w-11/12', 'w-4/5'] },
  { user: 'w-56', lines: ['w-full', 'w-3/4'] },
];

/** Placeholder for a session's transcript while it loads — shaped like the real turns
 *  so the layout does not shift when they arrive. */
export function SessionSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading conversation">
      {TURNS.map((turn, i) => (
        <div key={i} className="space-y-6">
          <div className="flex justify-end">
            <Skeleton className={`h-10 ${turn.user} rounded-2xl rounded-br-md`} />
          </div>
          <div className="w-full space-y-2.5">
            {turn.lines.map((line, j) => (
              <Skeleton key={j} className={`h-4 ${line}`} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
