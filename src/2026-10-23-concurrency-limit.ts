/**
 * Creates a concurrency limiter that ensures at most `limit` promises
 * run at the same time. Extra tasks are queued and start as soon as a
 * slot becomes free.
 *
 * Useful for rate-limiting API calls, image processing, etc.
 *
 * @example
 * ```ts
 * const limit = createConcurrencyLimit(2);
 *
 * const results = await Promise.all([
 *   limit(() => fetchUser(1)),
 *   limit(() => fetchUser(2)),
 *   limit(() => fetchUser(3)), // waits until one of the first two finishes
 * ]);
 * ```
 */
export function createConcurrencyLimit(limit: number) {
  if (limit < 1) {
    throw new Error('Concurrency limit must be at least 1');
  }

  let activeCount = 0;
  const queue: Array<() => void> = [];

  const next = () => {
    activeCount--;
    if (queue.length > 0) {
      const resolve = queue.shift()!;
      resolve();
    }
  };

  /**
   * Run an async task under the concurrency limit.
   */
  return function limitFn<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const run = () => {
        activeCount++;
        task()
          .then(resolve, reject)
          .finally(next);
      };

      if (activeCount < limit) {
        run();
      } else {
        queue.push(run);
      }
    });
  };
}

/**
 * Convenience helper that maps over an array of items with limited concurrency.
 *
 * @example
 * ```ts
 * const users = await mapWithLimit(ids, 3, (id) => fetchUser(id));
 * ```
 */
export async function mapWithLimit<
  T,
  R
>(items: readonly T[], limit: number, mapper: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const limiter = createConcurrencyLimit(limit);
  const results = await Promise.all(
    items.map((item, index) => limiter(() => mapper(item, index)))
  );
  return results;
}

// ---------------------------------------------------------------------------
// Usage example
// ---------------------------------------------------------------------------

/*
import { createConcurrencyLimit, mapWithLimit } from './concurrency-limit';

async function demo() {
  const limit = createConcurrencyLimit(2);

  const tasks = [1, 2, 3, 4, 5].map((n) =>
    limit(async () => {
      console.log(`Starting ${n}`);
      await new Promise((r) => setTimeout(r, 1000));
      console.log(`Finished ${n}`);
      return n * 2;
    })
  );

  const results = await Promise.all(tasks);
  console.log(results); // [2, 4, 6, 8, 10]

  // Or use the helper:
  const doubled = await mapWithLimit([1, 2, 3], 2, async (n) => n * 2);
  console.log(doubled);
}

demo();
*/
