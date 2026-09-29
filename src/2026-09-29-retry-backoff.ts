/**
 * Retry an async function with exponential backoff and optional jitter.
 *
 * Useful for flaky network calls, rate-limited APIs, and transient failures.
 */

export type RetryOptions = {
  /** Maximum number of attempts (including the first). Default: 3 */
  retries?: number;
  /** Initial delay in milliseconds. Default: 200 */
  initialDelayMs?: number;
  /** Maximum delay cap in milliseconds. Default: 8_000 */
  maxDelayMs?: number;
  /** Multiplier applied after each failed attempt. Default: 2 */
  factor?: number;
  /** Add randomness to avoid thundering herds. Default: true */
  jitter?: boolean;
  /** Decide whether a given error should be retried. Default: retry all */
  shouldRetry?: (error: unknown, attempt: number) => boolean;
  /** Called before each wait. */
  onRetry?: (error: unknown, attempt: number, delayMs: number) => void;
};

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

function computeDelay(
  attempt: number,
  initialDelayMs: number,
  factor: number,
  maxDelayMs: number,
  jitter: boolean,
): number {
  const exp = initialDelayMs * factor ** (attempt - 1);
  const capped = Math.min(exp, maxDelayMs);
  if (!jitter) return capped;
  // Full jitter: random in [0, capped]
  return Math.floor(Math.random() * (capped + 1));
}

/**
 * Run `fn` and retry on rejection using exponential backoff.
 *
 * @example
 * const data = await retry(
 *   () => fetch("/api/items").then((r) => {
 *     if (!r.ok) throw new Error(`HTTP ${r.status}`);
 *     return r.json();
 *   }),
 *   { retries: 4, initialDelayMs: 250 },
 * );
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    retries = 3,
    initialDelayMs = 200,
    maxDelayMs = 8_000,
    factor = 2,
    jitter = true,
    shouldRetry = () => true,
    onRetry,
  } = options;

  if (retries < 1) {
    throw new RangeError("retries must be at least 1");
  }

  let lastError: unknown;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const isLast = attempt >= retries;
      if (isLast || !shouldRetry(error, attempt)) {
        throw error;
      }
      const delayMs = computeDelay(
        attempt,
        initialDelayMs,
        factor,
        maxDelayMs,
        jitter,
      );
      onRetry?.(error, attempt, delayMs);
      await sleep(delayMs);
    }
  }

  throw lastError;
}

// ---------------------------------------------------------------------------
// Usage example (uncomment to try locally)
// ---------------------------------------------------------------------------
// async function fetchUser(id: string) {
//   const res = await fetch(`https://api.example.com/users/${id}`);
//   if (res.status === 429 || res.status >= 500) {
//     throw Object.assign(new Error(`status ${res.status}`), { status: res.status });
//   }
//   if (!res.ok) throw new Error(`permanent failure ${res.status}`);
//   return res.json();
// }
//
// retry(() => fetchUser("42"), {
//   retries: 5,
//   initialDelayMs: 300,
//   shouldRetry: (err) =>
//     typeof err === "object" &&
//     err !== null &&
//     "status" in err &&
//     ([429, 502, 503, 504] as number[]).includes((err as { status: number }).status),
//   onRetry: (err, attempt, delay) => {
//     console.warn(`attempt ${attempt} failed, waiting ${delay}ms`, err);
//   },
// }).then(console.log).catch(console.error);
