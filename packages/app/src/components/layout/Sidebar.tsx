import { useSessions } from '@/hooks/useSessions';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

export function Sidebar({ currentSessionId, onSelect }: {
  currentSessionId?: string;
  onSelect: (id: string) => void;
}) {
  const { sessions, isLoading, error, refetch } = useSessions();

  return (
      <div className="w-64 h-full min-h-0 border-r border-border bg-card flex flex-col">
        <div className="p-4.5 border-b flex items-center justify-between">
            <h2 className="text-lg font-medium">Mnesis</h2>
            <Badge variant="outline" className="text-xs">v0.0.1</Badge>
        </div>

        <ScrollArea className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-2 space-y-2">
            {isLoading &&
              Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-md" />
              ))}

            {!isLoading && error && (
              <p className="text-destructive text-sm px-2">
                Failed to load. <button onClick={refetch}>Retry</button>
              </p>
            )}

            {!isLoading &&
              sessions.map((s) => (
                <Button
                  key={s.id}
                  type="button"
                  variant={currentSessionId === s.id ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start text-left',
                    currentSessionId === s.id && 'font-medium'
                  )}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onSelect(s.id)}
                >
                  <span className="truncate">{s.title}</span>
                </Button>
              ))}
          </div>
        </ScrollArea>
      </div>
    );
}
