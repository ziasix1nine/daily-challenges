/**
 * React hook that sets up an interval that correctly handles changes to the
 * callback and delay, and pauses when the delay is null.
 *
 * Based on the recommended pattern from the React docs / Dan Abramov.
 *
 * @example
 * const [count, setCount] = useState(0);
 * useInterval(() => {
 *   setCount(c => c + 1);
 * }, 1000);
 */
import { useEffect, useRef } from 'react';

export function useInterval(
  callback: () => void,
  delay: number | null
): void {
  const savedCallback = useRef(callback);

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    if (delay === null) {
      return;
    }

    const id = setInterval(() => {
      savedCallback.current();
    }, delay);

    return () => clearInterval(id);
  }, [delay]);
}

// Usage example:
/*
function Timer() {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  useInterval(
    () => setSeconds(s => s + 1),
    isRunning ? 1000 : null
  );

  return (
    <div>
      <p>Seconds: {seconds}</p>
      <button onClick={() => setIsRunning(r => !r)}>
        {isRunning ? 'Pause' : 'Resume'}
      </button>
    </div>
  );
}
*/
