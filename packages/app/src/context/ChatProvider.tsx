import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatContext } from './ChatContext';
import type { ChatContextValue, Message } from '@/types/chat.type';
import { settings } from '@/config';
import { ROLE } from '@/types/chat.type';
import { useModels } from '@/hooks/useModels';
import { createSSEParser } from '@/lib/sse';
import type { SourceRef } from '@/lib/citations';

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
  const [selectedModel, setModel] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionLoading, setIsSessionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { models } = useModels();
  const [toolStatus, setToolStatus] = useState<string | undefined>(undefined);
  const abortRef = useRef<AbortController | null>(null);
  const isInitializedRef = useRef(false);
  const refetchSessionsRef = useRef<(() => void) | null>(null);

  // Derived, not stored: if the chosen model disappears from the live list,
  // this falls back to the server's default without a reconciliation effect.
  const defaultModel = models.find((m) => m.isDefault)?.id ?? models[0]?.id;
  const model =
    selectedModel && models.some((m) => m.id === selectedModel)
      ? selectedModel
      : defaultModel;

  const loadSession = useCallback(async (id: string) => {
    // Leaving a session mid-stream would otherwise keep consuming into a transcript
    // the user is no longer looking at.
    abortRef.current?.abort();
    setIsSessionLoading(true);
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


      const data: {
        role: typeof ROLE.USER | typeof ROLE.ASSISTANT;
        content: string;
        reasoning?: string;
        sources?: SourceRef[];
      }[] = await res.json();

      const mapped: Message[] = data.map((m, idx) => ({
        id: `${id}-${idx}`,
        role: m.role,
        content: m.content,
        reasoning: m.reasoning,
        sources: m.sources,
      }));

      setMessages(mapped);
      setSessionId(id);
      updateUrlWithSessionId(id);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error loading session';
      setError(msg);
    } finally {
      setIsSessionLoading(false);
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

  const stop = () => {
    abortRef.current?.abort();
  };

  const submit = async () => {
    if (!input.trim() || isLoading || isSessionLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: ROLE.USER,
      content: input.trim(),
    };
    const assistantId = `${Date.now() + 1}`;

    setMessages(prev => [
      ...prev,
      userMessage,
      { id: assistantId, role: 'assistant', content: '', reasoning: '', isStreaming: true },
    ]);
    setInput('');
    setIsLoading(true);
    setError(null);
    setToolStatus(undefined);

    const controller = new AbortController();
    abortRef.current = controller;
    const previousSessionId = sessionId;
    let newSessionId: string | undefined;

    // Deltas land far faster than React should re-render, and MarkdownRenderer re-parses
    // the whole document each time — so they are buffered and applied once per frame.
    const pending = { content: '', reasoning: '' };
    let frame = 0;

    const flush = () => {
      frame = 0;
      if (!pending.content && !pending.reasoning) return;
      const { content, reasoning } = pending;
      pending.content = '';
      pending.reasoning = '';
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? { ...m, content: m.content + content, reasoning: (m.reasoning ?? '') + reasoning }
            : m,
        ),
      );
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(flush);
    };

    try {
      const response = await fetch(`${settings.API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          prompt: userMessage.content,
          ...(model && { model }),
          ...(sessionId && { sessionId }),
        }),
      });

      if (!response.ok || !response.body) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || 'Request failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const parse = createSSEParser();

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;

        for (const frameData of parse(decoder.decode(value, { stream: true }))) {
          const payload = JSON.parse(frameData.data);

          switch (frameData.event) {
            case 'session':
              newSessionId = payload.sessionId;
              setSessionId(payload.sessionId);
              updateUrlWithSessionId(payload.sessionId);
              break;
            case 'reasoning':
              pending.reasoning += payload.delta;
              schedule();
              break;
            case 'content':
              pending.content += payload.delta;
              setToolStatus(undefined);
              schedule();
              break;
            case 'tool':
              setToolStatus(payload.status === 'start' ? payload.name : undefined);
              break;
            case 'sources':
              setMessages(prev =>
                prev.map(m => (m.id === assistantId ? { ...m, sources: payload.sources } : m)),
              );
              break;
            case 'error':
              setError(payload.message);
              break;
          }
        }
      }
    } catch (err) {
      // An aborted request is the user pressing stop — the partial answer stays.
      if (!(err instanceof DOMException && err.name === 'AbortError')) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    } finally {
      if (frame) cancelAnimationFrame(frame);
      flush();
      setMessages(prev =>
        prev.map(m => (m.id === assistantId ? { ...m, isStreaming: false } : m)),
      );
      setToolStatus(undefined);
      setIsLoading(false);
      abortRef.current = null;

      if (!previousSessionId && newSessionId) {
        refetchSessionsRef.current?.();
      }
    }
  };

  const setRefetchSessions = useCallback((refetch: () => void) => {
    refetchSessionsRef.current = refetch;
  }, []);

  const value: ChatContextValue = {
    messages,
    input,
    sessionId,
    models,
    model,
    toolStatus,
    isLoading,
    isSessionLoading,
    error,
    setInput,
    setModel,
    newSession,
    submit,
    stop,
    loadSession,
    setRefetchSessions,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
