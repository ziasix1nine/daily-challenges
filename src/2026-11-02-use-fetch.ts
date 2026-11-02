/**
 * useFetch — a simple, production-ready data-fetching hook for React.
 *
 * Handles loading, error, and data states. Supports refetch, abort on unmount,
 * and optional dependency-based automatic refetching.
 *
 * @example
 * const { data, loading, error, refetch } = useFetch<User>('/api/user/1');
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseFetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export interface UseFetchResult<T> extends UseFetchState<T> {
  refetch: () => Promise<void>;
}

export interface UseFetchOptions {
  /** Automatically refetch when these values change */
  deps?: unknown[];
  /** Fetch immediately on mount (default: true) */
  immediate?: boolean;
  /** Custom RequestInit options */
  requestInit?: RequestInit;
}

export function useFetch<T = unknown>(
  url: string | null | undefined,
  options: UseFetchOptions = {},
): UseFetchResult<T> {
  const { deps = [], immediate = true, requestInit } = options;

  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    loading: immediate && !!url,
    error: null,
  });

  const abortRef = useRef<AbortController | null>(null);
  const requestInitRef = useRef(requestInit);
  requestInitRef.current = requestInit;

  const execute = useCallback(async () => {
    if (!url) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(url, {
        ...requestInitRef.current,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = (await response.json()) as T;
      if (!controller.signal.aborted) {
        setState({ data, loading: false, error: null });
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      if (!controller.signal.aborted) {
        setState({
          data: null,
          loading: false,
          error: err instanceof Error ? err : new Error(String(err)),
        });
      }
    }
  }, [url]);

  useEffect(() => {
    if (immediate) {
      void execute();
    }
    return () => {
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [execute, ...deps]);

  return { ...state, refetch: execute };
}

/* Usage example (React component):

function UserProfile({ userId }: { userId: string }) {
  const { data, loading, error, refetch } = useFetch<User>(
    `/api/users/${userId}`,
    { deps: [userId] }
  );

  if (loading) return <p>Loading…</p>;
  if (error) return <p>Error: {error.message} <button onClick={refetch}>Retry</button></p>;
  if (!data) return null;

  return (
    <div>
      <h1>{data.name}</h1>
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
*/
