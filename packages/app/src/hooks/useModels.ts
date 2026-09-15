import { useSyncExternalStore } from 'react';
import { settings } from '@/config';
import { createStore, isBrowser } from '@/lib/store';
import type { ModelOption } from '@/types/chat.type';

const store = createStore<ModelOption[]>([]);

// Starts at import, not after first paint — the list is usually there before the
// selector renders, and no component needs to own the request.
if (isBrowser) {
  fetch(`${settings.API_URL}/model`)
    .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Failed to fetch models'))))
    .then((data: ModelOption[]) => store.set(data))
    .catch((error) => console.error('Failed to fetch models', error));
}

export function useModels() {
  const models = useSyncExternalStore(store.subscribe, store.get, store.get);
  return { models };
}
