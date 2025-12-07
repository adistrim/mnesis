import { Button } from '@/components/ui/button';
import type { LLMRequestType } from '@/types/chat.type';
import { Plus } from 'lucide-react';

interface Props {
  type: LLMRequestType;
  isLoading: boolean;
  setType: (t: LLMRequestType) => void;
  newSession: () => void;
}

export function Header({ type, isLoading, setType, newSession }: Props) {
  return (
    <div className="border-b border-border px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          <Button
            variant={type === 'chat' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setType('chat')}
            disabled={isLoading}
          >
            Chat
          </Button>
          <Button
            variant={type === 'reasoning' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setType('reasoning')}
            disabled={isLoading}
          >
            Reasoning
          </Button>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={newSession}
        disabled={isLoading}
      >
        <Plus className="w-4 h-4 mr-2" />
        New Session
      </Button>
    </div>
  );
}
