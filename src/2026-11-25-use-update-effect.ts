/**
 * Custom React hook that behaves like useEffect but skips the first render.
 * Useful for effects that should only run when dependencies change after mount.
 *
 * @example
 * useUpdateEffect(() => {
 *   console.log('value changed', value);
 * }, [value]);
 */
import { useEffect, useRef, type DependencyList, type EffectCallback } from 'react';

export function useUpdateEffect(effect: EffectCallback, deps?: DependencyList): void {
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    return effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

// Usage example:
// function Counter() {
//   const [count, setCount] = useState(0);
//
//   useUpdateEffect(() => {
//     console.log('Count updated to', count);
//   }, [count]);
//
//   return <button onClick={() => setCount(c => c + 1)}>Increment</button>;
// }
