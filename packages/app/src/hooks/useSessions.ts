import { useState, useEffect } from 'react';
import { settings } from '@/config';
import type { Session } from '@/types/chat.type';

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${settings.API_URL}/session`);

      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }

      const data: Session[] = await response.json();
      setSessions(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const deleteSession = async (sessionId: string) => {
    try {
      const response = await fetch(`${settings.API_URL}/session`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete session');
      }

      // Refetch sessions after deletion
      await fetchSessions();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    }
  };

  return {
    sessions,
    isLoading,
    error,
    refetch: fetchSessions,
    deleteSession,
  };
}
