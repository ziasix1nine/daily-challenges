/**
 * Throttle a function so it runs at most once per interval.
 *
 * Useful for scroll, resize, pointermove, and other high-frequency events
 * where you want a steady cadence rather than a trailing debounce.
 *
 * Options:
 * - leading (default true): invoke on the first call in a window
 * - trailing (default true): invoke once more with the latest args when the window ends
 *
 * The returned function also exposes cancel() and flush().
 */

export interface ThrottleOptions {
  /** Invoke immediately on the leading edge. Default: true */
  leading?: boolean;
  /** Invoke with the latest args on the trailing edge. Default: true */
  trailing?: boolean;
}

export interface ThrottledFunction<Args extends unknown[]> {
  (...args: Args): void;
  /** Drop a pending trailing call and reset the timer. */
  cancel: () => void;
  /** Run a pending trailing call immediately, if any. */
  flush: () => void;
}

export function throttle<Args extends unknown[]>(
  fn: (...args: Args) => void,
  waitMs: number,
  options: ThrottleOptions = {},
): ThrottledFunction<Args> {
  if (typeof fn !== "function") {
    throw new TypeError("throttle expects a function");
  }
  if (!Number.isFinite(waitMs) || waitMs < 0) {
    throw new RangeError("waitMs must be a non-negative finite number");
  }

  const leading = options.leading !== false;
  const trailing = options.trailing !== false;
  if (!leading && !trailing) {
    throw new Error("throttle requires leading or trailing (or both)");
  }

  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Args | null = null;
  let lastInvoke = 0;

  const invoke = (args: Args): void => {
    lastInvoke = Date.now();
    lastArgs = null;
    fn(...args);
  };

  const startTimer = (delay: number): void => {
    timer = setTimeout(onTimer, delay);
  };

  const onTimer = (): void => {
    timer = null;
    if (trailing && lastArgs) {
      invoke(lastArgs);
      startTimer(waitMs);
    }
  };

  const throttled = ((...args: Args): void => {
    const now = Date.now();
    if (lastInvoke === 0 && !leading) {
      lastInvoke = now;
    }

    const remaining = waitMs - (now - lastInvoke);
    lastArgs = args;

    if (remaining <= 0 || remaining > waitMs) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      if (leading) {
        invoke(args);
      } else {
        lastInvoke = now;
      }
      if (trailing) startTimer(waitMs);
      return;
    }

    if (!timer && trailing) startTimer(remaining);
  }) as ThrottledFunction<Args>;

  throttled.cancel = (): void => {
    if (timer) clearTimeout(timer);
    timer = null;
    lastArgs = null;
    lastInvoke = 0;
  };

  throttled.flush = (): void => {
    if (!lastArgs) return;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    invoke(lastArgs);
  };

  return throttled;
}

// --- usage example ---
const onScroll = throttle(
  (y: number) => {
    console.log("scroll", y);
  },
  100,
  { leading: true, trailing: true },
);

onScroll(window.scrollY);
// onScroll.cancel();
