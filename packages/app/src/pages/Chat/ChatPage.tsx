import { Header } from '@/components/layout/Header';
import { useChat } from '@/hooks/useChat';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { MessageList } from './components/MessageList';
import { ChatError } from './components/ChatError';
import { ChatInput } from './components/ChatInput';
import { Sidebar } from '@/components/layout/Sidebar';

export default function ChatPage() {
  const {
    messages,
    input,
    type,
    isLoading,
    error,
    sessionId,
    setInput,
    setType,
    newSession,
    submit,
    loadSession
  } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [messages]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar currentSessionId={sessionId} onSelect={loadSession} />

      <div className="flex flex-col flex-1 h-full overflow-hidden min-h-0">
        <Header
          type={type}
          isLoading={isLoading}
          setType={setType}
          newSession={newSession}
        />

        <MessageList
          messages={messages}
          isLoading={isLoading}
          containerRef={messagesContainerRef}
          endRef={messagesEndRef}
        />

        <ChatError error={error} />

        <ChatInput
          input={input}
          isLoading={isLoading}
          setInput={setInput}
          submit={submit}
          onKeyDown={handleKeyDown}
          textareaRef={textareaRef}
        />
      </div>
    </div>
  );
}
