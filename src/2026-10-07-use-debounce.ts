/**
 * useDebounce — delay a changing value until it has been stable for `delay` ms.
 *
 * Typical use: search inputs. The input updates immediately for a snappy UI,
 * while the debounced value drives the network request.
 *
 * @example
 * const [query, setQuery] = useState('');
 * const debouncedQuery = useDebounce(query, 300);
 * useEffect(() => { search(debouncedQuery); }, [debouncedQuery]);
 */

import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

/**
 * useDebouncedCallback — return a stable function that only fires after
 * calls have stopped for `delay` ms. The latest arguments win.
 *
 * The returned function is referentially stable across renders.
 */
export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay = 300,
): (...args: Args) => void {
  const callbackRef = useLatest(callback);
  const timerRef = useRefSafe<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, [timerRef]);

  const stable = useStableCallback((...args: Args) => {
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      callbackRef.current(...args);
    }, delay);
  });

  return stable;
}

function useLatest<T>(value: T): { current: T } {
  const ref = useRefSafe(value);
  ref.current = value;
  return ref;
}

function useRefSafe<T>(initial: T): { current: T } {
  const [ref] = useState(() => ({ current: initial }));
  return ref;
}

function useStableCallback<Args extends unknown[]>(
  fn: (...args: Args) => void,
): (...args: Args) => void {
  const fnRef = useLatest(fn);
  const [stable] = useState(() => (...args: Args) => fnRef.current(...args));
  return stable;
}

/* Usage example (React component):

function SearchBox() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 250);

  useEffect(() => {
    if (!debouncedQuery) return;
    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`);
  }, [debouncedQuery]);

  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}
*/
