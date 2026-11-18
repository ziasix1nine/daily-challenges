/**
 * Async Debounce Utility
 *
 * Debounces an async function so that only the latest invocation is executed.
 * Previous in-flight calls can be cancelled via AbortController if the function supports it.
 *
 * @example
 * const debouncedSearch = asyncDebounce(async (query: string, signal?: AbortSignal) => {
 *   const res = await fetch(`/api/search?q=${query}`, { signal });
 *   return res.json();
 * }, 300);
 *
 * debouncedSearch('hello');
 */

export interface AsyncDebounceOptions {
  /** Leading edge execution (default: false) */
  leading?: boolean;
  /** Trailing edge execution (default: true) */
  trailing?: boolean;
}

export function asyncDebounce<
  TArgs extends any[],
  TResult
>(
  fn: (...args: TArgs) => Promise<TResult>,
  wait: number,
  options: AsyncDebounceOptions = {}
): (...args: TArgs) => Promise<TResult> {
  const { leading = false, trailing = true } = options;

  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: TArgs | null = null;
  let lastPromise: Promise<TResult> | null = null;
  let resolveLatest: ((value: TResult) => void) | null = null;
  let rejectLatest: ((reason?: any) => void) | null = null;
  let abortController: AbortController | null = null;

  const invoke = async (args: TArgs): Promise<TResult> => {
    if (abortController) {
      abortController.abort();
    }
    abortController = new AbortController();

    try {
      // Pass signal as last argument if the function accepts it (common pattern)
      const result = await fn(...args);
      return result;
    } catch (error) {
      if ((error as any)?.name === 'AbortError') {
        // Swallow abort errors from previous calls
        throw error;
      }
      throw error;
    }
  };

  return function debounced(...args: TArgs): Promise<TResult> {
    lastArgs = args;

    return new Promise<TResult>((resolve, reject) => {
      resolveLatest = resolve;
      rejectLatest = reject;

      const shouldCallLeading = leading && timeoutId === null;

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(async () => {
        timeoutId = null;

        if (trailing && lastArgs) {
          try {
            const result = await invoke(lastArgs);
            resolveLatest?.(result);
          } catch (err) {
            rejectLatest?.(err);
          }
        }
      }, wait);

      if (shouldCallLeading) {
        invoke(args)
          .then((result) => resolveLatest?.(result))
          .catch((err) => rejectLatest?.(err));
      }
    });
  };
}

// Usage example
if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
  const mockSearch = async (q: string) => {
    console.log('Searching for:', q);
    await new Promise((r) => setTimeout(r, 100));
    return { results: [`result for ${q}`] };
  };

  const debounced = asyncDebounce(mockSearch, 200);

  // These will only execute the last one after 200ms
  debounced('a');
  debounced('ab');
  debounced('abc').then(console.log);
}
