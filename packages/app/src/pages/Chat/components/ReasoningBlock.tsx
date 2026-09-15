import { ChevronRight } from 'lucide-react';
import { memo, useState } from 'react';

interface Props {
  reasoning: string;
  isStreaming: boolean;
}

function ReasoningBlockBase({ reasoning, isStreaming }: Props) {
  const [expandedByUser, setExpandedByUser] = useState<boolean | null>(null);

  // Open while it is the only thing happening, collapsed once the answer starts —
  // unless the user has taken over the toggle.
  const isOpen = expandedByUser ?? isStreaming;

  return (
    <div className="mb-4">
      <button
        onClick={() => setExpandedByUser(!isOpen)}
        className="flex items-center gap-1.5 -ml-1 px-1 py-0.5 rounded text-sm text-muted-foreground hover:text-foreground transition-colors"
        aria-expanded={isOpen}
      >
        <ChevronRight
          className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
        />
        {isStreaming ? (
          <span className="shimmer-text font-medium">Thinking</span>
        ) : (
          <span>Thought process</span>
        )}
      </button>

      {isOpen && (
        <div className="mt-2 ml-[0.3rem] pl-4 border-l border-border/60 text-[0.8125rem] leading-[1.7] text-muted-foreground whitespace-pre-wrap break-words max-h-80 overflow-y-auto">
          {reasoning}
        </div>
      )}
    </div>
  );
}

export const ReasoningBlock = memo(ReasoningBlockBase);
