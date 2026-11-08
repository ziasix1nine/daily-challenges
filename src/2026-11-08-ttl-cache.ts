/**
 * Simple Time-To-Live (TTL) Cache implementation.
 * Stores key-value pairs that automatically expire after a specified time.
 * Useful for caching API responses, computed values, etc. in frontend apps.
 *
 * @example
 * const cache = new TTLCache<string, any>(60_000); // 60 seconds default TTL
 * cache.set('user:123', userData);
 * const data = cache.get('user:123'); // null if expired or missing
 */
export class TTLCache<K, V> {
  private cache = new Map<K, { value: V; expiresAt: number }>();
  private defaultTTL: number;

  /**
   * @param defaultTTL - Default time-to-live in milliseconds
   */
  constructor(defaultTTL: number = 5 * 60 * 1000) {
    this.defaultTTL = defaultTTL;
  }

  /**
   * Set a value with optional custom TTL.
   * @param key
   * @param value
   * @param ttl - Optional override for TTL in ms
   */
  set(key: K, value: V, ttl?: number): void {
    const expiresAt = Date.now() + (ttl ?? this.defaultTTL);
    this.cache.set(key, { value, expiresAt });
  }

  /**
   * Get a value if it exists and has not expired.
   * @param key
   * @returns The value or undefined if missing/expired
   */
  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  /**
   * Check if key exists and is not expired.
   */
  has(key: K): boolean {
    return this.get(key) !== undefined;
  }

  /**
   * Delete a specific key.
   */
  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all entries.
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Remove all expired entries. Call periodically if needed.
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  get size(): number {
    this.cleanup();
    return this.cache.size;
  }
}

// Usage example:
// const apiCache = new TTLCache<string, Response>(30_000);
// apiCache.set('/users', await fetch('/users').then(r => r.json()));
// const users = apiCache.get('/users');
