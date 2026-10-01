/**
 * Typed event emitter (pub/sub).
 *
 * Useful for decoupling UI modules without a framework: form validation,
 * media players, design-system toasts, or cross-component signals.
 *
 * Listeners are stored in insertion order and invoked synchronously.
 * `once` listeners are removed before they run so a throw cannot re-fire them.
 */

type Listener<T> = (payload: T) => void;

interface Subscription {
  unsubscribe: () => void;
}

export class EventEmitter<Events extends Record<string, unknown>> {
  #listeners = new Map<keyof Events, Set<Listener<Events[keyof Events]>>>();

  /**
   * Subscribe to `event`. Returns an unsubscribe handle.
   */
  on<K extends keyof Events>(event: K, listener: Listener<Events[K]>): Subscription {
    const set = this.#bucket(event);
    set.add(listener as Listener<Events[keyof Events]>);
    return {
      unsubscribe: () => {
        set.delete(listener as Listener<Events[keyof Events]>);
      },
    };
  }

  /**
   * Subscribe for a single emission, then remove the listener.
   */
  once<K extends keyof Events>(event: K, listener: Listener<Events[K]>): Subscription {
    const wrapped: Listener<Events[K]> = (payload) => {
      this.off(event, wrapped);
      listener(payload);
    };
    return this.on(event, wrapped);
  }

  /**
   * Remove a specific listener, or every listener for `event` when omitted.
   */
  off<K extends keyof Events>(event: K, listener?: Listener<Events[K]>): void {
    const set = this.#listeners.get(event);
    if (!set) return;
    if (!listener) {
      set.clear();
      return;
    }
    set.delete(listener as Listener<Events[keyof Events]>);
  }

  /**
   * Emit `event` to a snapshot of current listeners so subscribe/unsubscribe
   * during dispatch cannot skip or double-call a handler.
   */
  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    const set = this.#listeners.get(event);
    if (!set || set.size === 0) return;
    for (const listener of [...set]) {
      (listener as Listener<Events[K]>)(payload);
    }
  }

  /** Number of listeners currently registered for `event`. */
  listenerCount<K extends keyof Events>(event: K): number {
    return this.#listeners.get(event)?.size ?? 0;
  }

  /** Drop every listener for every event. */
  clear(): void {
    this.#listeners.clear();
  }

  #bucket<K extends keyof Events>(event: K): Set<Listener<Events[keyof Events]>> {
    let set = this.#listeners.get(event);
    if (!set) {
      set = new Set();
      this.#listeners.set(event, set);
    }
    return set;
  }
}

// --- usage example ---
interface AppEvents {
  "toast:show": { message: string; level: "info" | "error" };
  "cart:change": { count: number };
}

const bus = new EventEmitter<AppEvents>();

const sub = bus.on("toast:show", ({ message, level }) => {
  console.log(`[${level}] ${message}`);
});

bus.once("cart:change", ({ count }) => {
  console.log(`cart now has ${count} items`);
});

bus.emit("toast:show", { message: "Saved", level: "info" });
bus.emit("cart:change", { count: 2 });
bus.emit("cart:change", { count: 3 }); // once-listener already removed

sub.unsubscribe();
