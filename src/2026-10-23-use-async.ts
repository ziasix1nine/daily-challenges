import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * State returned by the useAsync hook.
 */
export interface AsyncState<T> {
  /** The resolved data, or undefined while pending / on error. */
  data: T | undefined;
  /** True while the async operation is in flight. */
  loading: boolean;
  /** The error thrown by the async function, or null. */
  error: Error | null;
}

/**
 * Options for useAsync.
 */
export interface UseAsyncOptions {
  /**
   * If true, the async function is executed immediately on mount
   * (and whenever the returned `execute` is called).
   * Default: true
   */
  immediate?: boolean;
}

/**
 * A React hook that manages the lifecycle of an async function.
 *
 * Tracks loading, error, and data states, and provides an `execute`
 * function to re-trigger the operation (useful for refetching).
 *
 * @example
 * ```tsx
 * function UserProfile({ userId }: { userId: string }) {
 *   const { data, loading, error, execute } = useAsync(
 *     () => fetch(`/api/users/${userId}`).then(r => r.json()),
 *     [userId]
 *   );
 *
 *   if (loading) return <Spinner />;
 *   if (error) return <div>Error: {error.message} <button onClick={execute}>Retry</button></div>;
 *   return <div>{data?.name}</div>;
 * }
 * ```
 */
export function useAsync<T>(
  asyncFn: () => Promise<T>,
  deps: React.DependencyList = [],
  options: UseAsyncOptions = {}
): AsyncState<T> & { execute: () => Promise<void> } {
  const { immediate = true } = options;

  const [state, setState] = useState<AsyncState<T>>({
    data: undefined,
    loading: immediate,
    error: null,
  });

  // Keep a stable reference to the latest async function
  const asyncFnRef = useRef(asyncFn);
  asyncFnRef.current = asyncFn;

  const execute = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const data = await asyncFnRef.current();
      setState({ data, loading: false, error: null });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setState({ data: undefined, loading: false, error });
    }
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { ...state, execute };
}

// ---------------------------------------------------------------------------
// Usage example (for documentation / quick testing)
// ---------------------------------------------------------------------------

/*
import { useAsync } from './use-async';

function Example() {
  const { data, loading, error, execute } = useAsync(async () => {
    const res = await fetch('https://api.github.com/users/octocat');
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  });

  if (loading) return <p>Loading…</p>;
  if (error) return <p>Error: {error.message}</p>;
  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <button onClick={execute}>Refresh</button>
    </div>
  );
}
*/
