/**
 * Random number and selection utilities for frontend use.
 *
 * Useful for games, tests, UI variety, A/B sampling, etc.
 */

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * @param min Lower bound (inclusive)
 * @param max Upper bound (inclusive)
 * @returns Random integer in [min, max]
 */
export function randomInt(min: number, max: number): number {
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    throw new Error('min and max must be finite numbers');
  }
  if (min > max) [min, max] = [max, min];
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Returns a random floating-point number between min (inclusive) and max (exclusive).
 * @param min Lower bound (inclusive)
 * @param max Upper bound (exclusive)
 */
export function randomFloat(min: number, max: number): number {
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    throw new Error('min and max must be finite numbers');
  }
  if (min > max) [min, max] = [max, min];
  return Math.random() * (max - min) + min;
}

/**
 * Picks a single random element from an array.
 * @throws if array is empty
 */
export function sample<T>(arr: readonly T[]): T {
  if (arr.length === 0) {
    throw new Error('Cannot sample from an empty array');
  }
  return arr[randomInt(0, arr.length - 1)];
}

/**
 * Returns a new array with n random elements from the source (without replacement).
 * If n >= arr.length, returns a shuffled copy of the entire array.
 */
export function sampleSize<T>(arr: readonly T[], n: number): T[] {
  if (n <= 0) return [];
  if (n >= arr.length) return [...arr].sort(() => Math.random() - 0.5);

  const copy = [...arr];
  for (let i = 0; i < n; i++) {
    const j = randomInt(i, copy.length - 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

/**
 * Weighted random selection. Higher weight = higher chance.
 * @param items Array of items
 * @param getWeight Function that returns a non-negative weight for each item
 */
export function weightedSample<T>(items: readonly T[], getWeight: (item: T) => number): T {
  if (items.length === 0) {
    throw new Error('Cannot sample from an empty array');
  }

  const weights = items.map(getWeight);
  const total = weights.reduce((sum, w) => sum + Math.max(0, w), 0);
  if (total <= 0) {
    return sample(items); // fallback to uniform
  }

  let random = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    random -= Math.max(0, weights[i]);
    if (random <= 0) return items[i];
  }
  return items[items.length - 1];
}

// ─── Usage examples ──────────────────────────────────────────────

if (import.meta.env?.DEV || typeof process !== 'undefined') {
  console.log('randomInt(1, 10):', randomInt(1, 10));
  console.log('sample(["a","b","c"]):', sample(['a', 'b', 'c']));
  console.log('sampleSize([1,2,3,4,5], 3):', sampleSize([1, 2, 3, 4, 5], 3));
  console.log(
    'weightedSample:',
    weightedSample(
      [{ id: 'rare', w: 1 }, { id: 'common', w: 10 }],
      (x) => x.w
    )
  );
}
