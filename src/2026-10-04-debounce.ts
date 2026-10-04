/**
 * Debounce a function so it runs only after calls stop for `wait` ms.
 *
 * Useful for search inputs, resize handlers, and autosave.
 * Leading calls can fire immediately; trailing calls fire after the quiet period.
 */

export interface DebounceOptions {
  /** Fire on the leading edge of the wait window. Default: false. */
  leading?: boolean;
  /** Fire on the trailing edge after the wait. Default: true. */
  trailing?: boolean;
  /** Max time a call can be delayed before it is forced. */
  maxWait?: number;
}

export interface DebouncedFunction<T extends (...args: never[]) => unknown> {
  (...args: Parameters<T>): ReturnType<T> | undefined;
  /** Cancel a pending invocation. */
  cancel: () => void;
  /** Invoke immediately if a call is pending. Returns the result when invoked. */
  flush: () => ReturnType<T> | undefined;
  /** True when a trailing call is scheduled. */
  pending: () => boolean;
}

export function debounce<T extends (...args: never[]) => unknown>(
  fn: T,
  wait = 0,
  options: DebounceOptions = {},
): DebouncedFunction<T> {
  if (typeof fn !== "function") {
    throw new TypeError("debounce expects a function");
  }
  if (!Number.isFinite(wait) || wait < 0) {
    throw new RangeError("wait must be a non-negative finite number");
  }

  const leading = options.leading === true;
  const trailing = options.trailing !== false;
  const maxWait =
    options.maxWait === undefined
      ? undefined
      : Math.max(0, options.maxWait);

  let timer: ReturnType<typeof setTimeout> | undefined;
  let lastArgs: Parameters<T> | undefined;
  let lastThis: unknown;
  let result: ReturnType<T> | undefined;
  let lastCallTime: number | undefined;
  let lastInvokeTime = 0;

  const invoke = (time: number): ReturnType<T> | undefined => {
    const args = lastArgs;
    const context = lastThis;
    lastArgs = undefined;
    lastThis = undefined;
    lastInvokeTime = time;
    if (args) {
      result = fn.apply(context, args) as ReturnType<T>;
    }
    return result;
  };

  const remainingWait = (time: number): number => {
    const sinceCall = time - (lastCallTime ?? time);
    const sinceInvoke = time - lastInvokeTime;
    const timeWaiting = wait - sinceCall;
    if (maxWait === undefined) return timeWaiting;
    return Math.min(timeWaiting, maxWait - sinceInvoke);
  };

  const shouldInvoke = (time: number): boolean => {
    if (lastCallTime === undefined) return false;
    const sinceCall = time - lastCallTime;
    const sinceInvoke = time - lastInvokeTime;
    return (
      sinceCall >= wait ||
      sinceCall < 0 ||
      (maxWait !== undefined && sinceInvoke >= maxWait)
    );
  };

  const timerExpired = (): void => {
    const time = Date.now();
    if (shouldInvoke(time)) {
      trailingEdge(time);
      return;
    }
    timer = setTimeout(timerExpired, remainingWait(time));
  };

  const leadingEdge = (time: number): ReturnType<T> | undefined => {
    lastInvokeTime = time;
    timer = setTimeout(timerExpired, wait);
    return leading ? invoke(time) : result;
  };

  const trailingEdge = (time: number): ReturnType<T> | undefined => {
    timer = undefined;
    if (trailing && lastArgs) return invoke(time);
    lastArgs = undefined;
    lastThis = undefined;
    return result;
  };

  const debounced = function (this: unknown, ...args: Parameters<T>) {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);
    lastArgs = args;
    lastThis = this;
    lastCallTime = time;

    if (timer === undefined) return leadingEdge(time);
    if (isInvoking) {
      clearTimeout(timer);
      timer = setTimeout(timerExpired, wait);
      return invoke(time);
    }
    return result;
  } as DebouncedFunction<T>;

  debounced.cancel = () => {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
    lastArgs = undefined;
    lastThis = undefined;
    lastCallTime = undefined;
    lastInvokeTime = 0;
  };

  debounced.flush = () => {
    if (timer === undefined) return result;
    return trailingEdge(Date.now());
  };

  debounced.pending = () => timer !== undefined;

  return debounced;
}

// Example:
// const onSearch = debounce((query: string) => fetch(`/api?q=${query}`), 300);
// input.addEventListener("input", (event) => {
//   onSearch((event.target as HTMLInputElement).value);
// });
