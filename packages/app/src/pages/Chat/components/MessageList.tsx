import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { ROLE, type Message } from '@/types/chat.type';
import Markdown from "react-markdown";

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
            <Card
              className={`max-w-[80%] p-4 ${
                message.role === ROLE.USER
                  ? 'bg-secondary text-secondary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <div className="whitespace-pre-wrap wrap-break-words">
                {message.role === ROLE.USER ? (
                  message.content
                ) : (
                  <Markdown>{message.content}</Markdown>
                )}
              </div>
            </Card>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <Card className="max-w-[80%] p-4 bg-muted">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </Card>
          </div>
        )}

        <div ref={endRef} />
      </div>
    </div>
  );
}
