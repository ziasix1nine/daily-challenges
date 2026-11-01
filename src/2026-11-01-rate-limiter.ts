/**
 * Simple rate limiter using a sliding window approach.
 * Limits how many times a function (or action) can be executed
 * within a given time window.
 *
 * Useful for API rate limiting, button spam protection,
 * analytics events, etc.
 *
 * @example
 * const limiter = createRateLimiter(3, 1000); // max 3 calls per second
 *
 * async function apiCall() {
 *   if (await limiter.acquire()) {
 *     // do the call
 *   } else {
 *     console.log('Rate limited');
 *   }
 * }
 */

export interface RateLimiter {
  /**
   * Attempt to acquire a slot.
   * Returns a promise that resolves to true if allowed, false if rate limited.
   * Optionally waits (with timeout) until a slot becomes available.
   */
  acquire(wait?: boolean, timeoutMs?: number): Promise<boolean>;

  /** Current number of calls recorded in the active window. */
  getCurrentCount(): number;

  /** Reset the limiter (clear all timestamps). */
  reset(): void;
}

/**
 * Creates a rate limiter.
 *
 * @param maxCalls Maximum number of allowed calls in the window
 * @param windowMs Size of the sliding window in milliseconds
 */
export function createRateLimiter(maxCalls: number, windowMs: number): RateLimiter {
  if (maxCalls < 1 || windowMs < 1) {
    throw new Error('maxCalls and windowMs must be positive');
  }

  const timestamps: number[] = [];

  function prune(now: number) {
    const cutoff = now - windowMs;
    while (timestamps.length > 0 && timestamps[0]! <= cutoff) {
      timestamps.shift();
    }
  }

  async function acquire(wait = false, timeoutMs = 0): Promise<boolean> {
    const now = Date.now();
    prune(now);

    if (timestamps.length < maxCalls) {
      timestamps.push(now);
      return true;
    }

    if (!wait) {
      return false;
    }

    // Wait for the oldest timestamp to expire
    const oldest = timestamps[0]!;
    const waitTime = oldest + windowMs - now + 1; // +1 to be safe

    if (timeoutMs > 0 && waitTime > timeoutMs) {
      return false;
    }

    await new Promise((resolve) => setTimeout(resolve, waitTime));

    // Recurse to try again (handles concurrent acquires reasonably)
    return acquire(wait, timeoutMs > 0 ? timeoutMs - waitTime : 0);
  }

  return {
    acquire,
    getCurrentCount: () => {
      prune(Date.now());
      return timestamps.length;
    },
    reset: () => {
      timestamps.length = 0;
    },
  };
}

// ---------- Usage Example ----------
const limiter = createRateLimiter(2, 1000); // 2 calls per second

async function demo() {
  console.log('First:', await limiter.acquire());   // true
  console.log('Second:', await limiter.acquire());  // true
  console.log('Third:', await limiter.acquire());   // false

  console.log('Waiting...');
  console.log('Fourth (wait):', await limiter.acquire(true, 2000)); // true after ~1s
  console.log('Current count:', limiter.getCurrentCount());
}

// Uncomment to run:
// demo();
