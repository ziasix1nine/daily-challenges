/**
 * React hook that returns the previous value of a given value.
 * Useful for comparing previous vs current props/state or running effects on change.
 *
 * @example
 * function Counter({ count }: { count: number }) {
 *   const prevCount = usePrevious(count);
 *   return <p>Now: {count}, before: {prevCount}</p>;
 * }
 */
import { useEffect, useRef } from 'react';

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

// Usage example (in a React component):
// const prevValue = usePrevious(currentValue);
// if (prevValue !== undefined && prevValue !== currentValue) {
//   console.log('Value changed from', prevValue, 'to', currentValue);
// }
