import { useSyncExternalStore } from 'react';
import { settings } from '@/config';
import { createStore, isBrowser } from '@/lib/store';

export type Coords = { latitude: number; longitude: number };

const STORAGE_KEY = 'mnesis-precise-location';

function readStored(): Coords | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Coords) : null;
  } catch {
    return null;
  }
}

function store_(coords: Coords | null) {
  try {
    if (coords) localStorage.setItem(STORAGE_KEY, JSON.stringify(coords));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // a refused write only costs the memo across reloads
  }
}

const coordsStore = createStore<Coords | null>(isBrowser ? readStored() : null);

/**
 * Resolves location server-side while the user is still typing, so the first message
 * does not wait on it. Fired at import and again the moment coordinates arrive — both
 * are events, neither is a render concern.
 */
function warm(coords: Coords | null) {
  if (!isBrowser) return;
  fetch(`${settings.API_URL}/context/warm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(coords ?? {}),
    keepalive: true,
  }).catch(() => {
    // Warming is an optimisation; the chat request resolves it anyway.
  });
}

let asked = false;

function capture() {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const next = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      coordsStore.set(next);
      store_(next);
      warm(next);
    },
    () => {
      // Denied or unavailable: stay silent and let the IP fallback stand.
      coordsStore.set(null);
      store_(null);
    },
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 10 * 60 * 1000 },
  );
}

if (isBrowser) {
  warm(coordsStore.get());

  // Already-granted permission reads back without showing a prompt, so a returning user
  // gets precise coordinates without being asked again.
  if ('geolocation' in navigator && navigator.permissions?.query) {
    navigator.permissions
      .query({ name: 'geolocation' as PermissionName })
      .then((status) => {
        if (status.state === 'granted') {
          asked = true;
          capture();
        } else if (status.state === 'denied') {
          asked = true;
          coordsStore.set(null);
          store_(null);
        }
      })
      .catch(() => {
        // Permissions API unavailable; ensureRequested still handles the prompt.
      });
  }
}

/**
 * Called when a message is sent. Triggers the browser prompt at most once per page and
 * deliberately does not block the send — the IP fallback covers that turn.
 */
function ensureRequested() {
  if (asked || !isBrowser) return;
  if (!('geolocation' in navigator)) return;
  asked = true;
  capture();
}

export function useLocation() {
  const coords = useSyncExternalStore(
    coordsStore.subscribe,
    coordsStore.get,
    coordsStore.get,
  );
  return { coords, ensureRequested };
}
