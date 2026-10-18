/**
 * Custom React hook that runs a callback after a delay, with cleanup.
 * Similar to setTimeout but integrated with React lifecycle.
 *
 * @param callback - Function to execute after the delay
 * @param delay - Delay in milliseconds. Pass null to clear/disable.
 *
 * @example
 * ```tsx
 * function Toast() {
 *   const [visible, setVisible] = useState(true);
 *   useTimeout(() => setVisible(false), visible ? 3000 : null);
 *   return visible ? <div>Toast message</div> : null;
 * }
 * ```
 */
import { useEffect, useRef } from 'react';

export function useTimeout(callback: () => void, delay: number | null): void {
  const savedCallback = useRef(callback);

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const id = setTimeout(() => {
      savedCallback.current();
    }, delay);

    return () => clearTimeout(id);
  }, [delay]);
}

// Usage example (uncomment to test in a React component):
//
// import { useState } from 'react';
//
// function Demo() {
//   const [count, setCount] = useState(0);
//   useTimeout(() => setCount(c => c + 1), 1000);
//   return <div>Count: {count}</div>;
// }
