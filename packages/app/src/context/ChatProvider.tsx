import React, { useState } from 'react';
import { ChatContext } from './ChatContext';
import type { ChatContextValue, Message, LLMRequestType } from '@/types/chat';
import { API_URL } from '@/config';

export default function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [type, setType] = useState<LLMRequestType>('chat');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const newSession = () => {
    setMessages([]);
    setSessionId(undefined);
    setError(null);
    // Focusing the textarea is handled by the consumer via its own ref
  };

  const submit = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMessage.content,
          type,
          ...(sessionId && { sessionId }),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Request failed');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response.message,
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (data.response.sessionId) {
        setSessionId(data.response.sessionId);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const value: ChatContextValue = {
    messages,
    input,
    sessionId,
    type,
    isLoading,
    error,
    setInput,
    setType,
    newSession,
    submit,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
