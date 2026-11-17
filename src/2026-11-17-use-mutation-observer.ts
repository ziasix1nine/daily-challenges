/**
 * Custom React hook that observes DOM mutations on a target element
 * using the MutationObserver API.
 *
 * Useful for reacting to attribute changes, child list modifications,
 * or character data updates without polling.
 *
 * @example
 * ```tsx
 * function LiveRegion() {
 *   const ref = useRef<HTMLDivElement>(null);
 *
 *   useMutationObserver(
 *     ref,
 *     (mutations) => {
 *       mutations.forEach((m) => console.log(m.type, m.target));
 *     },
 *     { childList: true, subtree: true, attributes: true }
 *   );
 *
 *   return <div ref={ref}>Content that changes</div>;
 * }
 * ```
 */

import { useEffect, useRef, type RefObject } from 'react';

export interface UseMutationObserverOptions extends MutationObserverInit {
  /** Whether observation is active (default: true) */
  enabled?: boolean;
}

export function useMutationObserver(
  targetRef: RefObject<Node | null>,
  callback: (mutations: MutationRecord[], observer: MutationObserver) => void,
  options: UseMutationObserverOptions = {}
): void {
  const { enabled = true, ...observerOptions } = options;
  const callbackRef = useRef(callback);

  // Keep callback fresh without re-subscribing
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled || !targetRef.current) return;

    const observer = new MutationObserver((mutations, obs) => {
      callbackRef.current(mutations, obs);
    });

    observer.observe(targetRef.current, observerOptions);

    return () => {
      observer.disconnect();
    };
  }, [targetRef, enabled, observerOptions]);
}

// Usage example:
// const ref = useRef<HTMLElement>(null);
// useMutationObserver(ref, (mutations) => {
//   console.log('DOM changed:', mutations.length, 'mutations');
// }, { childList: true, subtree: true });
