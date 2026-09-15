/**
 * Minimal external store for app-global data that is loaded once and is not derived
 * from props or state. Paired with useSyncExternalStore this replaces the
 * fetch-on-mount effect: the work starts at module import rather than after first
 * paint, and components merely subscribe.
 */
export type Store<T> = {
    get: () => T;
    set: (next: T) => void;
    subscribe: (listener: () => void) => () => void;
};

export function createStore<T>(initial: T): Store<T> {
    let value = initial;
    const listeners = new Set<() => void>();

    return {
        get: () => value,
        set: (next: T) => {
            if (Object.is(next, value)) return;
            value = next;
            for (const listener of listeners) listener();
        },
        subscribe: (listener) => {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
    };
}

export const isBrowser = typeof window !== "undefined";
