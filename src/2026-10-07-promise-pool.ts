/**
 * Promise pool — run async tasks with a fixed concurrency limit.
 *
 * Useful for frontend work that must not stampede the network: image
 * prefetch, batched API writes, or paginated backfills.
 *
 * Tasks are started in input order. Results are returned in the same order
 * as the input, even if later tasks finish first. The first rejection fails
 * the pool after in-flight tasks settle (fail-fast on the returned promise,
 * no unhandled rejections from siblings).
 */

export interface PoolOptions {
  /** Maximum number of tasks running at once. Must be >= 1. */
  concurrency: number;
}

export async function promisePool<T>(
  tasks: Array<() => Promise<T>>,
  options: PoolOptions,
): Promise<T[]> {
  const limit = Math.floor(options.concurrency);
  if (!Number.isFinite(limit) || limit < 1) {
    throw new RangeError('promisePool: concurrency must be an integer >= 1');
  }

  const results = new Array<T>(tasks.length);
  let nextIndex = 0;
  let firstError: unknown;

  async function worker(): Promise<void> {
    while (firstError === undefined) {
      const index = nextIndex;
      nextIndex += 1;
      if (index >= tasks.length) return;

      try {
        results[index] = await tasks[index]();
      } catch (error) {
        if (firstError === undefined) firstError = error;
        return;
      }
    }
  }

  const workers = Array.from({ length: Math.min(limit, tasks.length) }, () => worker());
  await Promise.all(workers);

  if (firstError !== undefined) throw firstError;
  return results;
}

/**
 * Map items through an async function with a concurrency cap.
 * Preserves input order in the resolved array.
 */
export function mapPool<T, R>(
  items: readonly T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  return promisePool(
    items.map((item, index) => () => mapper(item, index)),
    { concurrency },
  );
}

/* Usage example:

const urls = ['/a.png', '/b.png', '/c.png', '/d.png'];

const blobs = await mapPool(urls, 2, async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed ${url}`);
  return response.blob();
});

console.log(blobs.length); // 4, fetched at most 2 at a time
*/
