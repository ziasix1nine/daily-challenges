/**
 * Custom React hook that returns a throttled version of a value.
 * The returned value only updates at most once every `delay` milliseconds.
 *
 * Useful for expensive operations that shouldn't run on every change
 * (e.g., window resize, scroll position, search input).
 *
 * @example
 * ```tsx
 * function SearchComponent() {
 *   const [query, setQuery] = useState('');
 *   const throttledQuery = useThrottle(query, 300);
 *
 *   useEffect(() => {
 *     if (throttledQuery) {
 *       // Perform search only every 300ms at most
 *       search(throttledQuery);
 *     }
 *   }, [throttledQuery]);
 *
 *   return <input value={query} onChange={e => setQuery(e.target.value)} />;
 * }
 * ```
 */
import { useEffect, useRef, useState } from 'react';

export function useThrottle<T>(value: T, delay: number = 300): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastExecuted = useRef<number>(Date.now());
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const now = Date.now();
    const remaining = delay - (now - lastExecuted.current);

    if (remaining <= 0) {
      // Execute immediately
      setThrottledValue(value);
      lastExecuted.current = now;
    } else {
      // Schedule for later
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setThrottledValue(value);
        lastExecuted.current = Date.now();
      }, remaining);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return throttledValue;
}

/**
 * Hook that returns a throttled callback function.
 * The callback will be invoked at most once every `delay` milliseconds.
 *
 * @example
 * ```tsx
 * const handleScroll = useThrottledCallback(() => {
 *   console.log('Scrolled!', window.scrollY);
 * }, 100);
 *
 * useEffect(() => {
 *   window.addEventListener('scroll', handleScroll);
 *   return () => window.removeEventListener('scroll', handleScroll);
 * }, [handleScroll]);
 * ```
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  const callbackRef = useRef(callback);
  const lastExecuted = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const throttled = useRef((...args: Parameters<T>) => {
    const now = Date.now();

    if (now - lastExecuted.current >= delay) {
      callbackRef.current(...args);
      lastExecuted.current = now;
    } else if (!timeoutRef.current) {
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
        lastExecuted.current = Date.now();
        timeoutRef.current = null;
      }, delay - (now - lastExecuted.current));
    }
  }).current;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttled;
}

// Usage example
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('useThrottle and useThrottledCallback hooks loaded');
}
