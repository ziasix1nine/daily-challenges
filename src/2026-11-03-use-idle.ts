/**
 * Custom React hook to detect if the user is idle (no mouse/keyboard/touch activity)
 * for a specified period of time.
 *
 * Useful for auto-logout, pausing animations, analytics, or showing "Are you still there?" prompts.
 *
 * @example
 * ```tsx
 * function App() {
 *   const isIdle = useIdle(60_000); // idle after 1 minute
 *
 *   return (
 *     <div>
 *       {isIdle ? 'You are idle' : 'Active'}
 *     </div>
 *   );
 * }
 * ```
 */

import { useEffect, useRef, useState } from 'react';

export interface UseIdleOptions {
  /** Events that count as user activity. Default covers mouse, keyboard, and touch. */
  events?: string[];
  /** Whether to start in idle state. Default: false */
  initialState?: boolean;
}

const DEFAULT_EVENTS = [
  'mousemove',
  'mousedown',
  'keydown',
  'touchstart',
  'wheel',
  'scroll',
] as const;

export function useIdle(
  timeout: number = 60_000,
  options: UseIdleOptions = {}
): boolean {
  const { events = DEFAULT_EVENTS, initialState = false } = options;

  const [isIdle, setIsIdle] = useState(initialState);
  const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleActivity = () => {
      setIsIdle(false);

      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }

      timeoutId.current = setTimeout(() => {
        setIsIdle(true);
      }, timeout);
    };

    // Start the timer immediately
    handleActivity();

    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [timeout, events]);

  return isIdle;
}

// ─── Usage example (uncomment to test in a React component) ───
//
// function IdleDemo() {
//   const isIdle = useIdle(5000);
//
//   return (
//     <div style={{ padding: 40 }}>
//       <h1>{isIdle ? '💤 Idle' : '🚀 Active'}</h1>
//       <p>Move your mouse or press a key to reset the timer.</p>
//     </div>
//   );
// }
