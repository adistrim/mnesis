import { ROLE, type Message } from '@/types/chat.type';
import { MarkdownRenderer } from "./MarkdownRenderer";
import { ReasoningBlock } from "./ReasoningBlock";
import { StreamStatus } from "./StreamStatus";
import { SessionSkeleton } from "./SessionSkeleton";

interface Props {
  messages: Message[];
  isLoading: boolean;
  isSessionLoading?: boolean;
  toolStatus?: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
  endRef: React.RefObject<HTMLDivElement | null>;
}

export function MessageList({ messages, isLoading, isSessionLoading, toolStatus, containerRef, endRef }: Props) {
  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-6 py-8 min-h-0"
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {isSessionLoading && <SessionSkeleton />}

        {!isSessionLoading && messages.length === 0 && (
          <div className="text-center text-muted-foreground mt-20">
            <p className="text-lg mb-2">Start a conversation</p>
            <p className="text-sm">Type a message below to begin</p>
          </div>
        )}

        {!isSessionLoading && messages.map((message) => (
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
                {message.reasoning && (
                  <ReasoningBlock
                    reasoning={message.reasoning}
                    isStreaming={Boolean(message.isStreaming) && !message.content}
                  />
                )}

                {message.isStreaming && !message.reasoning && !message.content && (
                  <StreamStatus />
                )}

                {message.isStreaming && toolStatus && <StreamStatus tool={toolStatus} />}

                {message.content && (
                  <>
                    <MarkdownRenderer content={message.content} />
                    {message.isStreaming && <span className="stream-caret" aria-hidden />}
                  </>
                )}
              </div>
            )}
          </div>
        ))}

        {isLoading && !isSessionLoading && !messages.some(m => m.isStreaming) && (
          <div className="flex justify-start">
            <StreamStatus />
          </div>
        )}

        <div ref={endRef} />
      </div>
    </div>
  );
}
