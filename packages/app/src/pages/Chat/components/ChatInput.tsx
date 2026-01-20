import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';
import { useRef, useEffect } from 'react';

interface Props {
  input: string;
  isLoading: boolean;
  setInput: (v: string) => void;
  submit: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

export function ChatInput({
  input,
  isLoading,
  setInput,
  submit,
  onKeyDown,
  textareaRef
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [input, textareaRef]);

  return (
    <div className="px-4 py-4 bg-linear-to-t from-background via-background to-transparent">
      <div className="max-w-3xl mx-auto">
        <div 
          ref={containerRef}
          className="relative flex items-end bg-muted/50 border border-border rounded-2xl shadow-sm hover:shadow-md focus-within:shadow-md focus-within:border-primary/50 transition-all duration-200"
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Message..."
            disabled={isLoading}
            rows={1}
            className="flex-1 bg-transparent px-4 py-3 pr-14 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none max-h-[200px] scrollbar-thin"
            style={{ minHeight: '48px' }}
          />
          
          <div className="absolute right-2 bottom-2">
            <Button
              onClick={submit}
              size="icon"
              disabled={!input.trim() || isLoading}
              className="h-8 w-8 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              aria-label="Send Message"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground/60 text-center mt-2">
          Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Enter</kbd> to send · <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Shift+Enter</kbd> for new line
        </p>
      </div>
    </div>
  );
}
