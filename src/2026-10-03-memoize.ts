/**
 * Memoize an expensive pure function.
 *
 * Results are keyed by a stable serialization of the arguments. The cache
 * is bounded (LRU eviction) and each entry can expire after a TTL so the
 * helper stays safe for derived UI data, formatters, and request wrappers.
 *
 * Not suitable for functions with side effects or arguments that cannot be
 * serialized (DOM nodes, functions, circular structures).
 */

export interface MemoizeOptions {
  /** Max cached entries. Oldest entry is dropped when the limit is hit. */
  maxSize?: number;
  /** Entry lifetime in milliseconds. Omit for entries that never expire. */
  ttlMs?: number;
  /** Custom cache key. Defaults to JSON serialization of the argument list. */
  resolver?: (...args: never[]) => string;
}

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export interface Memoized<Args extends unknown[], R> {
  (...args: Args): R;
  /** Drop one key, or the whole cache when called with no arguments. */
  clear: (...args: Args | []) => void;
  /** True when a fresh entry exists for these arguments. */
  has: (...args: Args) => boolean;
  readonly size: number;
}

const DEFAULT_MAX_SIZE = 100;

function defaultResolver(...args: unknown[]): string {
  return JSON.stringify(args);
}

export function memoize<
  Args extends unknown[],
  R,
>(fn: (...args: Args) => R, options: MemoizeOptions = {}): Memoized<Args, R> {
  const maxSize = options.maxSize ?? DEFAULT_MAX_SIZE;
  const ttlMs = options.ttlMs;
  const resolver = (options.resolver ?? defaultResolver) as (
    ...args: Args
  ) => string;

  if (!Number.isFinite(maxSize) || maxSize < 1) {
    throw new RangeError("memoize maxSize must be a positive finite number");
  }
  if (ttlMs !== undefined && (!Number.isFinite(ttlMs) || ttlMs < 0)) {
    throw new RangeError("memoize ttlMs must be a non-negative finite number");
  }

  const cache = new Map<string, CacheEntry<R>>();

  const isFresh = (entry: CacheEntry<R>): boolean =>
    ttlMs === undefined || entry.expiresAt > Date.now();

  const touch = (key: string, entry: CacheEntry<R>): void => {
    cache.delete(key);
    cache.set(key, entry);
  };

  const memoized = ((...args: Args): R => {
    const key = resolver(...args);
    const existing = cache.get(key);

    if (existing && isFresh(existing)) {
      touch(key, existing);
      return existing.value;
    }

    if (existing) cache.delete(key);

    const value = fn(...args);
    cache.set(key, {
      value,
      expiresAt: ttlMs === undefined ? Infinity : Date.now() + ttlMs,
    });

    if (cache.size > maxSize) {
      const oldest = cache.keys().next().value;
      if (oldest !== undefined) cache.delete(oldest);
    }

    return value;
  }) as Memoized<Args, R>;

  memoized.clear = (...args: Args | []) => {
    if (args.length === 0) {
      cache.clear();
      return;
    }
    cache.delete(resolver(...(args as Args)));
  };

  memoized.has = (...args: Args): boolean => {
    const key = resolver(...args);
    const entry = cache.get(key);
    if (!entry) return false;
    if (!isFresh(entry)) {
      cache.delete(key);
      return false;
    }
    return true;
  };

  Object.defineProperty(memoized, "size", {
    get: () => cache.size,
  });

  return memoized;
}

// --- usage example ---
function expensiveFormat(user: { id: number; name: string }): string {
  return `${user.name.trim().toLowerCase()}#${user.id}`;
}

const formatUser = memoize(expensiveFormat, { maxSize: 50, ttlMs: 30_000 });

formatUser({ id: 7, name: "Ada" });
formatUser({ id: 7, name: "Ada" }); // cache hit
formatUser.clear({ id: 7, name: "Ada" });
