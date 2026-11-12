/**
 * A strongly-typed event bus (pub-sub) implementation.
 * Allows type-safe event emission and subscription with automatic cleanup.
 *
 * @example
 * ```ts
 * type AppEvents = {
 *   'user:login': { userId: string; timestamp: number };
 *   'notification': { message: string; type: 'info' | 'error' };
 *   'data:refresh': void;
 * };
 *
 * const bus = createEventBus<AppEvents>();
 *
 * const unsubscribe = bus.on('user:login', (payload) => {
 *   console.log('User logged in:', payload.userId);
 * });
 *
 * bus.emit('user:login', { userId: '123', timestamp: Date.now() });
 *
 * unsubscribe();
 * ```
 */

type EventMap = Record<string, any>;

type Listener<T> = (payload: T) => void;

export interface EventBus<Events extends EventMap> {
  /** Subscribe to an event. Returns an unsubscribe function. */
  on<K extends keyof Events>(
    event: K,
    listener: Listener<Events[K]>
  ): () => void;

  /** Subscribe to an event that fires only once. */
  once<K extends keyof Events>(
    event: K,
    listener: Listener<Events[K]>
  ): () => void;

  /** Emit an event with payload. */
  emit<K extends keyof Events>(
    event: K,
    payload: Events[K]
  ): void;

  /** Remove all listeners for an event, or all events if none specified. */
  off<K extends keyof Events>(event?: K): void;

  /** Get the number of listeners for an event. */
  listenerCount<K extends keyof Events>(event: K): number;
}

export function createEventBus<Events extends EventMap = EventMap>(): EventBus<Events> {
  const listeners = new Map<keyof Events, Set<Listener<any>>>();

  function getListeners<K extends keyof Events>(event: K): Set<Listener<Events[K]>> {
    if (!listeners.has(event)) {
      listeners.set(event, new Set());
    }
    return listeners.get(event)!;
  }

  return {
    on<K extends keyof Events>(event: K, listener: Listener<Events[K]>) {
      const set = getListeners(event);
      set.add(listener);

      return () => {
        set.delete(listener);
      };
    },

    once<K extends keyof Events>(event: K, listener: Listener<Events[K]>) {
      const wrapped = (payload: Events[K]) => {
        listener(payload);
        this.off(event); // This won't work correctly - better to handle inside
      };

      // Better implementation: track and remove after first call
      const onceListener: Listener<Events[K]> = (payload) => {
        listener(payload);
        const set = getListeners(event);
        set.delete(onceListener);
      };

      return this.on(event, onceListener);
    },

    emit<K extends keyof Events>(event: K, payload: Events[K]) {
      const set = listeners.get(event);
      if (!set) return;

      // Copy to avoid issues if listeners modify the set during emit
      const current = Array.from(set);
      for (const listener of current) {
        try {
          listener(payload);
        } catch (err) {
          console.error(`Error in event listener for "${String(event)}":`, err);
        }
      }
    },

    off<K extends keyof Events>(event?: K) {
      if (event === undefined) {
        listeners.clear();
      } else {
        listeners.delete(event);
      }
    },

    listenerCount<K extends keyof Events>(event: K) {
      return listeners.get(event)?.size ?? 0;
    },
  };
}

// Usage example
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
  type DemoEvents = {
    ping: { time: number };
    done: void;
  };

  const bus = createEventBus<DemoEvents>();

  const unsub = bus.on('ping', (data) => {
    console.log('Received ping at', data.time);
  });

  bus.emit('ping', { time: Date.now() });
  console.log('Listeners:', bus.listenerCount('ping'));

  unsub();
  console.log('After unsub:', bus.listenerCount('ping'));
}
