/**
 * Call-count wrappers for event handlers and one-shot UI setup.
 *
 * - once: run the function on the first call, then return the cached result
 * - after: ignore calls until the function has been invoked `n` times
 * - before: allow the function to run at most `n` times
 *
 * Useful for analytics beacons, modal open handlers, and "confirm after N clicks".
 */

export interface LimitedFn<Args extends unknown[], R> {
  (...args: Args): R | undefined;
  /** How many times the wrapper has been invoked (including ignored calls). */
  readonly calls: number;
  /** Restore the original call budget and clear any cached result. */
  reset: () => void;
}

function withCallCount<
  Args extends unknown[],
  R,
>(invoke: (args: Args, calls: number) => R | undefined): LimitedFn<Args, R> {
  let calls = 0;

  const wrapped = ((...args: Args): R | undefined => {
    calls += 1;
    return invoke(args, calls);
  }) as LimitedFn<Args, R>;

  Object.defineProperty(wrapped, "calls", {
    get: () => calls,
  });

  wrapped.reset = () => {
    calls = 0;
    invoke([] as unknown as Args, 0);
  };

  return wrapped;
}

/**
 * Run `fn` only on the first invocation. Later calls return the same result
 * without calling `fn` again. `reset()` allows it to run once more.
 */
export function once<Args extends unknown[], R>(
  fn: (...args: Args) => R,
): LimitedFn<Args, R> {
  let hasRun = false;
  let cached: R | undefined;

  const wrapped = withCallCount<Args, R>((args) => {
    if (!hasRun) {
      cached = fn(...args);
      hasRun = true;
    }
    return cached;
  });

  const reset = wrapped.reset;
  wrapped.reset = () => {
    hasRun = false;
    cached = undefined;
    reset();
  };

  return wrapped;
}

/**
 * Invoke `fn` only on the nth call and every call after that.
 * Calls before `n` return undefined.
 *
 * `after(3, fn)` runs `fn` starting on the third invocation.
 */
export function after<Args extends unknown[], R>(
  n: number,
  fn: (...args: Args) => R,
): LimitedFn<Args, R> {
  if (!Number.isInteger(n) || n < 1) {
    throw new RangeError("after(n) requires a positive integer");
  }

  return withCallCount<Args, R>((args, calls) => {
    if (calls === 0) return undefined;
    if (calls < n) return undefined;
    return fn(...args);
  });
}

/**
 * Invoke `fn` at most `n` times. Further calls return undefined.
 *
 * `before(2, fn)` runs `fn` on the first and second invocation only.
 */
export function before<Args extends unknown[], R>(
  n: number,
  fn: (...args: Args) => R,
): LimitedFn<Args, R> {
  if (!Number.isInteger(n) || n < 1) {
    throw new RangeError("before(n) requires a positive integer");
  }

  return withCallCount<Args, R>((args, calls) => {
    if (calls === 0) return undefined;
    if (calls > n) return undefined;
    return fn(...args);
  });
}

// --- usage example ---
const trackSignup = once((plan: string) => {
  console.log("signup", plan);
  return plan;
});

trackSignup("pro");
trackSignup("free"); // ignored, returns "pro"

const enableExport = after(3, () => "ready");
enableExport(); // undefined
enableExport();
enableExport(); // "ready"

const allowRetry = before(2, (reason: string) => reason);
allowRetry("network");
allowRetry("timeout");
allowRetry("abort"); // undefined
