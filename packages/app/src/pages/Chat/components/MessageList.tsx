import { Loader2 } from 'lucide-react';
import { ROLE, type Message } from '@/types/chat.type';
import { MarkdownRenderer } from "./MarkdownRenderer";

interface Props {
  messages: Message[];
  isLoading: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  endRef: React.RefObject<HTMLDivElement | null>;
}

export function MessageList({ messages, isLoading, containerRef, endRef }: Props) {
  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-6 py-8 min-h-0"
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground mt-20">
            <p className="text-lg mb-2">Start a conversation</p>
            <p className="text-sm">Type a message below to begin</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === ROLE.USER ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === ROLE.USER ? (
              <div className="max-w-[80%] px-4 py-3 bg-secondary text-secondary-foreground rounded-2xl rounded-br-md shadow-sm">
                <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                  {message.content}
                </div>
              </div>
            ) : (
              <div className="w-full">
                <MarkdownRenderer content={message.content} />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 text-muted-foreground py-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>
    </div>
  );
}
