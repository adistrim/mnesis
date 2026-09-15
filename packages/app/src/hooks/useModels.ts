import { useState, useEffect } from 'react';
import { settings } from '@/config';
import type { ModelOption } from '@/types/chat.type';

export function useModels() {
  const [models, setModels] = useState<ModelOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync with the server's live model list on mount.
  useEffect(() => {
    let cancelled = false;

    const fetchModels = async () => {
      try {
        const response = await fetch(`${settings.API_URL}/model`);

        if (!response.ok) {
          throw new Error('Failed to fetch models');
        }

        const data: ModelOption[] = await response.json();
        if (!cancelled) setModels(data);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchModels();

    return () => {
      cancelled = true;
    };
  }, []);

  return { models, isLoading, error };
}
