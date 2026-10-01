/**
 * Simple LRU (Least Recently Used) cache.
 *
 * Keeps up to `capacity` entries. Getting or setting a key marks it as most
 * recently used. When capacity is exceeded, the least recently used entry is
 * evicted.
 *
 * Implemented with a Map so insertion order tracks recency (O(1) get/set/delete
 * in modern JS engines).
 */

export class LRUCache<K, V> {
  private readonly store = new Map<K, V>();

  constructor(private readonly capacity: number) {
    if (!Number.isInteger(capacity) || capacity < 1) {
      throw new RangeError("LRUCache capacity must be a positive integer");
    }
  }

  get size(): number {
    return this.store.size;
  }

  /** Return the value and mark the key as most recently used. */
  get(key: K): V | undefined {
    if (!this.store.has(key)) return undefined;
    const value = this.store.get(key) as V;
    this.touch(key, value);
    return value;
  }

  /** Insert or update a value and mark the key as most recently used. */
  set(key: K, value: V): this {
    if (this.store.has(key)) {
      this.touch(key, value);
      return this;
    }
    if (this.store.size >= this.capacity) {
      const oldest = this.store.keys().next().value as K;
      this.store.delete(oldest);
    }
    this.store.set(key, value);
    return this;
  }

  has(key: K): boolean {
    return this.store.has(key);
  }

  delete(key: K): boolean {
    return this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  /** Peek without updating recency. */
  peek(key: K): V | undefined {
    return this.store.get(key);
  }

  keys(): K[] {
    return [...this.store.keys()];
  }

  private touch(key: K, value: V): void {
    this.store.delete(key);
    this.store.set(key, value);
  }
}

/** Factory helper when a class instance is not needed at the call site. */
export function createLRUCache<K, V>(capacity: number): LRUCache<K, V> {
  return new LRUCache<K, V>(capacity);
}

// ---------------------------------------------------------------------------
// Usage example
// ---------------------------------------------------------------------------

const cache = new LRUCache<string, number>(2);

cache.set("a", 1);
cache.set("b", 2);
cache.get("a"); // "a" is now most recently used
cache.set("c", 3); // evicts "b"

// cache.has("b") === false
// cache.get("a") === 1
// cache.get("c") === 3
