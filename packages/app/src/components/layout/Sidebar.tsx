import { useSessions } from '@/hooks/useSessions';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { AlertTriangle, SquarePen, Trash2 } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function Sidebar({ currentSessionId, onSelect, newSession }: {
  currentSessionId?: string;
  onSelect: (id: string) => void;
  newSession: () => void;
}) {
  const { sessions, isLoading, error, refetch, deleteSession } = useSessions();
  const { setRefetchSessions } = useChat();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<{ id: string; title: string } | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setRefetchSessions(refetch);
  }, [refetch, setRefetchSessions]);

  const handleDeleteClick = (session: { id: string; title: string }) => {
    setSessionToDelete(session);
    setDeleteConfirmText('');
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!sessionToDelete || deleteConfirmText !== sessionToDelete.title) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteSession(sessionToDelete.id);
      setDeleteDialogOpen(false);
      setSessionToDelete(null);
      setDeleteConfirmText('');
      
      // If the deleted session was the current one, create a new session
      if (currentSessionId === sessionToDelete.id) {
        newSession();
      }
    } catch {
      // Error is handled by the hook
    } finally {
      setIsDeleting(false);
    }
  };

  return (
      <div className="w-64 h-full min-h-0 border-r border-border bg-card flex flex-col">
        <div className="p-4.5 border-b flex items-center justify-between">
            <h2 className="text-lg font-medium">Mnesis</h2>
            <Badge variant="outline" className="text-xs">v0.0.1</Badge>
        </div>

        <div className="p-4 border-b">
          <Button
            variant="outline"
            size="sm"
            className="w-full" 
            onClick={newSession}
            disabled={isLoading}
          >
            <SquarePen className="w-4 h-4 mr-2" />
            New Session
          </Button>
        </div>

        <ScrollArea className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-2">
            {isLoading &&
              Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-md" />
              ))}

            {!isLoading && error && (
              <div className="text-destructive text-sm px-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Failed to load. <Button variant="link" size="sm" className='text-destructive' onClick={refetch}>Retry</Button>
              </div>
            )}

            {!isLoading &&
              sessions.map((s) => (
                <div
                  key={s.id}
                  className="group relative flex items-center"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <Button
                    type="button"
                    variant={currentSessionId === s.id ? 'secondary' : 'ghost'}
                    className={cn(
                      'w-full justify-start text-left flex-1',
                      currentSessionId === s.id && 'font-medium'
                    )}
                    onClick={() => onSelect(s.id)}
                  >
                    <span className="truncate">{s.title}</span>
                  </Button>
                  <Button
                    type="button"
                    size="icon-sm"
                    className={cn(
                      'opacity-0 bg-card hover:bg-card group-hover:opacity-100 transition-opacity absolute right-1 h-8 w-8 text-muted-foreground'
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick({ id: s.id, title: s.title });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete session</span>
                  </Button>
                </div>
              ))}
          </div>
        </ScrollArea>

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Session</DialogTitle>
              <DialogDescription>
                This action cannot be undone. To confirm deletion, please type the session title below.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <label htmlFor="delete-confirm" className="text-sm font-medium mb-2 block">
                Session Title: <span className="font-normal text-muted-foreground">{sessionToDelete?.title}</span>
              </label>
              <input
                id="delete-confirm"
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type the session title to confirm"
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isDeleting}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setSessionToDelete(null);
                  setDeleteConfirmText('');
                }}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={isDeleting || deleteConfirmText !== sessionToDelete?.title}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
}
