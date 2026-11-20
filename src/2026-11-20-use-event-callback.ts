/**
 * useEventCallback — React hook that returns a stable callback reference
 * whose latest implementation is always called.
 *
 * Solves the classic problem of stale closures in event handlers and effects
 * without forcing you to list every dependency or re-create the callback on
 * every render.
 *
 * Ideal for:
 * - Passing callbacks to memoized children
 * - Event listeners that need the freshest state
 * - Avoiding exhaustive-deps warnings while staying correct
 *
 * @example
 * ```tsx
 * function Search({ onSearch }: { onSearch: (q: string) => void }) {
 *   const [query, setQuery] = useState('');
 *
 *   const stableSearch = useEventCallback((q: string) => {
 *     onSearch(q);          // always the latest onSearch
 *     console.log(query);   // always the latest query
 *   });
 *
 *   return <input onChange={(e) => stableSearch(e.target.value)} />;
 * }
 * ```
 */

import { useCallback, useRef } from 'react';

export function useEventCallback<T extends (...args: any[]) => any>(fn: T): T {
  const ref = useRef<T>(fn);

  // Keep the ref up-to-date with the latest function on every render
  ref.current = fn;

  // Return a stable callback that always invokes the latest version
  return useCallback(
    ((...args: Parameters<T>) => {
      return ref.current(...args);
    }) as T,
    []
  );
}

// ---------------------------------------------------------------------------
// Usage example
// ---------------------------------------------------------------------------

/*
import { useState } from 'react';

function Demo() {
  const [count, setCount] = useState(0);

  const handleClick = useEventCallback(() => {
    console.log('Current count is', count);
    setCount((c) => c + 1);
  });

  // handleClick identity never changes, yet it always sees the latest count
  return <button onClick={handleClick}>Clicked {count} times</button>;
}
*/
