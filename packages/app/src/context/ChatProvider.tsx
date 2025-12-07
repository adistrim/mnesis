import React, { useState } from 'react';
import { ChatContext } from './ChatContext';
import type { ChatContextValue, Message, LLMRequestType } from '@/types/chat.type';
import { settings } from '@/config';
import { ROLE } from '@/types/chat.type';

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
  };

  const loadSession = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${settings.API_URL}/session/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: id }),
      });

      if (!res.ok) {
        throw new Error('Failed to load session');
      }


      const data: { role: typeof ROLE.USER | typeof ROLE.ASSISTANT; content: string }[] =
        await res.json();

      const mapped: Message[] = data.map((m, idx) => ({
        id: `${id}-${idx}`,
        role: m.role,
        content: m.content,
      }));

      setMessages(mapped);
      setSessionId(id);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error loading session';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const submit = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: ROLE.USER,
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${settings.API_URL}/chat`, {
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
      const msg = err instanceof Error ? err.message : 'An error occurred';
      setError(msg);
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
    loadSession,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
