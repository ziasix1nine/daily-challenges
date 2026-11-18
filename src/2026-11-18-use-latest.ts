/**
 * useLatest React Hook
 *
 * Returns a ref that always holds the latest value.
 * Useful for accessing the current value of props, state, or callbacks
 * inside effects or event handlers without adding them to dependency arrays.
 *
 * @example
 * function Component({ onChange }) {
 *   const latestOnChange = useLatest(onChange);
 *
 *   useEffect(() => {
 *     const handler = () => latestOnChange.current?.();
 *     window.addEventListener('resize', handler);
 *     return () => window.removeEventListener('resize', handler);
 *   }, []); // stable effect
 * }
 */

import { useRef, useEffect } from 'react';

export function useLatest<T>(value: T): { readonly current: T } {
  const ref = useRef(value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref;
}

/**
 * Alternative implementation that updates synchronously during render
 * (slightly more aggressive, but common in libraries)
 */
export function useLatestSync<T>(value: T): { readonly current: T } {
  const ref = useRef(value);
  ref.current = value; // update on every render
  return ref;
}

// Usage example (pseudo, for documentation)
/*
import { useEffect } from 'react';
import { useLatest } from './2026-11-18-use-latest';

function SearchInput({ onSearch }: { onSearch: (q: string) => void }) {
  const latestOnSearch = useLatest(onSearch);

  useEffect(() => {
    const id = setInterval(() => {
      // always calls the latest onSearch without re-running effect
      latestOnSearch.current('periodic');
    }, 5000);

    return () => clearInterval(id);
  }, []);

  return <input />;
}
*/
