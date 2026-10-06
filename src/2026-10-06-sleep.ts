/**
 * Promise-based sleep and polling helpers.
 *
 * Use these instead of raw `setTimeout` when you need awaitable delays
 * that can be cancelled (route changes, unmounts, user abort).
 */

export interface SleepOptions {
  /** Rejects the sleep early when aborted. */
  signal?: AbortSignal;
}

export class SleepAbortedError extends Error {
  readonly name = "SleepAbortedError";

  constructor(message = "Sleep was aborted") {
    super(message);
  }
}

function assertDuration(ms: number): void {
  if (!Number.isFinite(ms) || ms < 0) {
    throw new RangeError(`Expected a finite duration >= 0, received ${ms}`);
  }
}

/**
 * Resolve after `ms` milliseconds.
 *
 * @example
 * await sleep(250);
 * await sleep(1000, { signal: controller.signal });
 */
export function sleep(ms: number, options: SleepOptions = {}): Promise<void> {
  assertDuration(ms);
  const { signal } = options;

  if (signal?.aborted) {
    return Promise.reject(new SleepAbortedError());
  }

  return new Promise((resolve, reject) => {
    const timer = setTimeout(finish, ms);

    function finish(): void {
      cleanup();
      resolve();
    }

    function onAbort(): void {
      cleanup();
      reject(new SleepAbortedError());
    }

    function cleanup(): void {
      clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
    }

    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

export interface SleepUntilOptions extends SleepOptions {
  /** How often to re-check the predicate. Default 50ms. */
  interval?: number;
  /** Fail if the predicate is still false after this many ms. */
  timeout?: number;
}

/**
 * Poll `predicate` until it returns true, or reject on timeout/abort.
 *
 * @example
 * await sleepUntil(() => document.getElementById("ready") !== null, {
 *   interval: 100,
 *   timeout: 3000,
 * });
 */
export async function sleepUntil(
  predicate: () => boolean,
  options: SleepUntilOptions = {},
): Promise<void> {
  const interval = options.interval ?? 50;
  assertDuration(interval);
  if (options.timeout !== undefined) assertDuration(options.timeout);

  const started = Date.now();
  while (!predicate()) {
    if (options.timeout !== undefined && Date.now() - started >= options.timeout) {
      throw new Error(`sleepUntil timed out after ${options.timeout}ms`);
    }
    await sleep(interval, { signal: options.signal });
  }
}

// --- usage example ---
async function example(): Promise<void> {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), 5000);

  await sleep(200);
  console.log("waited 200ms");

  try {
    await sleepUntil(() => false, {
      interval: 100,
      timeout: 300,
      signal: controller.signal,
    });
  } catch (error) {
    console.log(error instanceof Error ? error.message : error);
  }
}

void example;
