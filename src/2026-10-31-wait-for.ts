/**
 * Waits until a condition function returns a truthy value, then resolves with that value.
 * Useful for waiting on DOM elements, async state, or external resources.
 *
 * Rejects if the timeout is exceeded.
 *
 * @example
 * const element = await waitFor(() => document.querySelector('#my-el'));
 *
 * @example
 * const result = await waitFor(
 *   () => someAsyncCheck(),
 *   { interval: 100, timeout: 5000 }
 * );
 */
export interface WaitForOptions {
  /** How often to check the condition, in ms. Default: 50 */
  interval?: number;
  /** Maximum time to wait, in ms. Default: 5000 */
  timeout?: number;
  /** Optional abort signal to cancel the wait */
  signal?: AbortSignal;
}

export async function waitFor<T>(
  condition: () => T | Promise<T>,
  options: WaitForOptions = {}
): Promise<T> {
  const {
    interval = 50,
    timeout = 5000,
    signal,
  } = options;

  const start = Date.now();

  return new Promise<T>((resolve, reject) => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
      signal?.removeEventListener('abort', onAbort);
    };

    const onAbort = () => {
      cleanup();
      reject(new DOMException('Wait aborted', 'AbortError'));
    };

    if (signal?.aborted) {
      return reject(new DOMException('Wait aborted', 'AbortError'));
    }
    signal?.addEventListener('abort', onAbort);

    const check = async () => {
      try {
        const result = await condition();
        if (result) {
          cleanup();
          resolve(result);
          return;
        }
      } catch (err) {
        // Continue waiting on errors unless timeout
      }

      if (Date.now() - start >= timeout) {
        cleanup();
        reject(new Error(`waitFor timed out after ${timeout}ms`));
      }
    };

    // Initial check
    void check();

    intervalId = setInterval(() => {
      void check();
    }, interval);

    timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error(`waitFor timed out after ${timeout}ms`));
    }, timeout);
  });
}

// Usage example
if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
  // Example: wait for an element (would work in browser)
  // const el = await waitFor(() => document.getElementById('app'));
  console.log('waitFor utility loaded');
}
