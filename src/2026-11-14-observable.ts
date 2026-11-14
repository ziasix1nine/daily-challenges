/**
 * A lightweight, type-safe Observable (pub-sub) for frontend state or events.
 *
 * Supports:
 * - Subscribing with unsubscribe
 * - Emitting values
 * - Optional initial value
 * - Derived observables (map)
 *
 * @example
 * const counter = createObservable(0);
 * const unsub = counter.subscribe(value => console.log(value));
 * counter.next(1);
 * unsub();
 */

type Subscriber<T> = (value: T) => void;

export interface Observable<T> {
  /** Current value (if any) */
  get value(): T | undefined;
  /** Subscribe to changes. Returns unsubscribe function. */
  subscribe(subscriber: Subscriber<T>): () => void;
  /** Emit a new value to all subscribers */
  next(value: T): void;
  /** Create a derived observable */
  map<U>(project: (value: T) => U): Observable<U>;
}

export function createObservable<T>(initial?: T): Observable<T> {
  let current: T | undefined = initial;
  const subscribers = new Set<Subscriber<T>>();

  const observable: Observable<T> = {
    get value() {
      return current;
    },

    subscribe(subscriber) {
      subscribers.add(subscriber);
      // Immediately notify with current value if it exists
      if (current !== undefined) {
        subscriber(current);
      }
      return () => {
        subscribers.delete(subscriber);
      };
    },

    next(value) {
      current = value;
      for (const sub of subscribers) {
        sub(value);
      }
    },

    map(project) {
      const derived = createObservable<U>();
      // Type assertion needed for generic U
      const derivedTyped = derived as Observable<ReturnType<typeof project>>;

      const unsub = observable.subscribe((value) => {
        derivedTyped.next(project(value));
      });

      // Cleanup is implicit when subscribers drop, but we could track it
      // For simplicity we rely on the parent lifecycle
      return derivedTyped;
    },
  };

  return observable;
}

// Usage example
if (typeof process !== "undefined" && process.env.NODE_ENV !== "production") {
  const count = createObservable(0);
  const doubled = count.map((n) => n * 2);

  const unsub = doubled.subscribe((v) => console.log("doubled:", v));
  count.next(5); // logs "doubled: 10"
  unsub();
}
