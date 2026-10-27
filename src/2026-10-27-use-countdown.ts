/**
 * useCountdown – React hook for a countdown timer.
 *
 * Starts from `seconds` and ticks down to 0. Provides start/pause/reset
 * controls and the remaining time.
 *
 * @example
 * const { secondsLeft, isRunning, start, pause, reset } = useCountdown(60);
 *
 * <button onClick={isRunning ? pause : start}>
 *   {isRunning ? 'Pause' : 'Start'}
 * </button>
 * <span>{secondsLeft}s</span>
 * <button onClick={reset}>Reset</button>
 */
import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseCountdownOptions {
  /** Callback fired when the countdown reaches 0 */
  onComplete?: () => void;
  /** Auto-start the countdown on mount (default: false) */
  autoStart?: boolean;
}

export interface UseCountdownReturn {
  /** Remaining seconds */
  secondsLeft: number;
  /** Whether the timer is currently running */
  isRunning: boolean;
  /** Start or resume the countdown */
  start: () => void;
  /** Pause the countdown */
  pause: () => void;
  /** Reset to the initial duration and stop */
  reset: (newDuration?: number) => void;
}

export function useCountdown(
  initialSeconds: number,
  options: UseCountdownOptions = {}
): UseCountdownReturn {
  const { onComplete, autoStart = false } = options;

  const [secondsLeft, setSecondsLeft] = useState(Math.max(0, Math.floor(initialSeconds)));
  const [isRunning, setIsRunning] = useState(autoStart && initialSeconds > 0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (secondsLeft <= 0) return;
    setIsRunning(true);
  }, [secondsLeft]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(
    (newDuration?: number) => {
      clear();
      const duration = newDuration !== undefined
        ? Math.max(0, Math.floor(newDuration))
        : Math.max(0, Math.floor(initialSeconds));
      setSecondsLeft(duration);
      setIsRunning(false);
    },
    [clear, initialSeconds]
  );

  useEffect(() => {
    if (!isRunning) {
      clear();
      return;
    }

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clear();
          setIsRunning(false);
          // Defer so state updates settle before the callback
          queueMicrotask(() => onCompleteRef.current?.());
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clear;
  }, [isRunning, clear]);

  // Cleanup on unmount
  useEffect(() => clear, [clear]);

  return { secondsLeft, isRunning, start, pause, reset };
}

/* ------------------------------------------------------------------ */
/* Usage example (copy into a component)                              */
/* ------------------------------------------------------------------ */
/*
function TimerDemo() {
  const { secondsLeft, isRunning, start, pause, reset } = useCountdown(30, {
    onComplete: () => console.log('Time\'s up!'),
  });

  return (
    <div>
      <p>{secondsLeft} seconds left</p>
      <button onClick={isRunning ? pause : start}>
        {isRunning ? 'Pause' : 'Start'}
      </button>
      <button onClick={() => reset()}>Reset</button>
      <button onClick={() => reset(10)}>Reset to 10s</button>
    </div>
  );
}
*/
