import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatContext } from './ChatContext';
import type { ChatContextValue, Message, LLMRequestType } from '@/types/chat.type';
import { settings } from '@/config';
import { ROLE } from '@/types/chat.type';

const getSessionIdFromUrl = (): string | null => {
  const pathname = window.location.pathname;
  const sessionId = pathname.slice(1);
  return sessionId || null;
};

// Helper function to update URL with session ID
const updateUrlWithSessionId = (sessionId: string | undefined) => {
  const url = new URL(window.location.href);
  if (sessionId) {
    url.pathname = `/${sessionId}`;
  } else {
    url.pathname = '/';
  }
  // Clear any query parameters
  url.search = '';
  window.history.replaceState({}, '', url.toString());
};

export default function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [type, setType] = useState<LLMRequestType>('chat');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isInitializedRef = useRef(false);
  const refetchSessionsRef = useRef<(() => void) | null>(null);

  const loadSession = useCallback(async (id: string) => {
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
      updateUrlWithSessionId(id);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error loading session';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load session from URL on mount
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;
    
    const urlSessionId = getSessionIdFromUrl();
    if (urlSessionId) {
      loadSession(urlSessionId);
    }
  }, [loadSession]);

  // Sync URL when sessionId changes (after initialization)
  useEffect(() => {
    if (isInitializedRef.current) {
      updateUrlWithSessionId(sessionId);
    }
  }, [sessionId]);

  const newSession = () => {
    setMessages([]);
    setSessionId(undefined);
    setError(null);
    updateUrlWithSessionId(undefined);
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
        const previousSessionId = sessionId;
        setSessionId(data.response.sessionId);
        updateUrlWithSessionId(data.response.sessionId);
        
        // If this is a new session (was undefined before), refetch the sidebar
        if (!previousSessionId && data.response.sessionId) {
          refetchSessionsRef.current?.();
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An error occurred';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const setRefetchSessions = useCallback((refetch: () => void) => {
    refetchSessionsRef.current = refetch;
  }, []);

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
    setRefetchSessions,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
