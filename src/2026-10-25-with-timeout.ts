/**
 * withTimeout
 *
 * Races a promise against a timeout. Rejects with a TimeoutError if the
 * original promise does not settle within the given milliseconds.
 *
 * Useful for network requests, long-running computations, or any async
 * operation that should not hang indefinitely.
 *
 * @example
 * const result = await withTimeout(fetch('/api/data'), 5000);
 *
 * @example
 * try {
 *   await withTimeout(someLongTask(), 2000);
 * } catch (err) {
 *   if (err instanceof TimeoutError) {
 *     console.log('Timed out!');
 *   }
 * }
 */

export class TimeoutError extends Error {
  constructor(message = 'Operation timed out') {
    super(message);
    this.name = 'TimeoutError';
  }
}

export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  errorMessage?: string
): Promise<T> {
  if (ms <= 0) {
    return promise;
  }

  let timeoutId: ReturnType<typeof setTimeout>;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new TimeoutError(errorMessage ?? `Timed out after ${ms}ms`));
    }, ms);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  }) as Promise<T>;
}

// ---------------------------------------------------------------------------
// Usage example
// ---------------------------------------------------------------------------
async function example() {
  const slow = new Promise<string>((resolve) => {
    setTimeout(() => resolve('done'), 3000);
  });

  try {
    const value = await withTimeout(slow, 1000);
    console.log(value);
  } catch (err) {
    if (err instanceof TimeoutError) {
      console.error(err.message); // "Timed out after 1000ms"
    }
  }
}

// Uncomment to run:
// example();
