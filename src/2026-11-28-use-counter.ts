/**
 * Custom React hook for managing a numeric counter with common operations.
 *
 * Provides increment, decrement, reset, and set functions with optional
 * min/max bounds.
 *
 * @param initialValue - Starting value of the counter (default: 0)
 * @param options - Optional configuration for bounds and step size
 * @returns Object containing the current count and control functions
 *
 * @example
 * ```tsx
 * function Counter() {
 *   const { count, increment, decrement, reset, set } = useCounter(0, {
 *     min: 0,
 *     max: 10,
 *     step: 1,
 *   });
 *
 *   return (
 *     <div>
 *       <p>Count: {count}</p>
 *       <button onClick={increment}>+</button>
 *       <button onClick={decrement}>-</button>
 *       <button onClick={reset}>Reset</button>
 *       <button onClick={() => set(5)}>Set to 5</button>
 *     </div>
 *   );
 * }
 * ```
 */
import { useCallback, useState } from 'react';

export interface UseCounterOptions {
  /** Minimum allowed value (inclusive). Default: -Infinity */
  min?: number;
  /** Maximum allowed value (inclusive). Default: Infinity */
  max?: number;
  /** Amount to change on increment/decrement. Default: 1 */
  step?: number;
}

export interface UseCounterReturn {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  set: (value: number) => void;
}

export function useCounter(
  initialValue = 0,
  options: UseCounterOptions = {}
): UseCounterReturn {
  const { min = -Infinity, max = Infinity, step = 1 } = options;

  const clamp = (value: number): number =>
    Math.min(max, Math.max(min, value));

  const [count, setCount] = useState(() => clamp(initialValue));

  const increment = useCallback(() => {
    setCount((prev) => clamp(prev + step));
  }, [step, min, max]);

  const decrement = useCallback(() => {
    setCount((prev) => clamp(prev - step));
  }, [step, min, max]);

  const reset = useCallback(() => {
    setCount(clamp(initialValue));
  }, [initialValue, min, max]);

  const set = useCallback(
    (value: number) => {
      setCount(clamp(value));
    },
    [min, max]
  );

  return { count, increment, decrement, reset, set };
}

// Usage example (uncomment to test in a React component)
/*
import { useCounter } from './2026-11-28-use-counter';

function Demo() {
  const counter = useCounter(5, { min: 0, max: 10 });

  return (
    <div>
      <span>{counter.count}</span>
      <button onClick={counter.increment}>+</button>
      <button onClick={counter.decrement}>-</button>
    </div>
  );
}
*/
