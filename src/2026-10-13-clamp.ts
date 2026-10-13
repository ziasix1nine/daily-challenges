/**
 * Clamps a number between a minimum and maximum value.
 * Returns the value unchanged if it is already within the range.
 *
 * Handles edge cases:
 * - Non-finite numbers (NaN, Infinity) are returned as-is.
 * - If min > max, the bounds are swapped.
 *
 * @example
 * ```ts
 * clamp(5, 0, 10);   // 5
 * clamp(-2, 0, 10);  // 0
 * clamp(15, 0, 10);  // 10
 * clamp(7, 10, 0);   // 7 (bounds swapped)
 * ```
 */

/**
 * Restricts a number to the inclusive range [min, max].
 *
 * @param value - The number to clamp.
 * @param min - Lower bound (inclusive).
 * @param max - Upper bound (inclusive).
 * @returns The clamped value, or the original value if it is not finite.
 */
export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return value;

  // Ensure min ≤ max
  const lower = Math.min(min, max);
  const upper = Math.max(min, max);

  return Math.min(Math.max(value, lower), upper);
}

/**
 * Creates a reusable clamp function with fixed bounds.
 *
 * @example
 * ```ts
 * const clampPercent = clampTo(0, 100);
 * clampPercent(150); // 100
 * clampPercent(-5);  // 0
 * ```
 */
export function clampTo(min: number, max: number): (value: number) => number {
  return (value: number) => clamp(value, min, max);
}

/**
 * Clamps a value and then normalizes it to the 0–1 range relative to [min, max].
 * Useful for progress bars, animations, etc.
 *
 * @example
 * ```ts
 * normalize(50, 0, 100); // 0.5
 * normalize(200, 0, 100); // 1
 * ```
 */
export function normalize(value: number, min: number, max: number): number {
  const clamped = clamp(value, min, max);
  const range = max - min;
  if (range === 0) return 0;
  return (clamped - Math.min(min, max)) / Math.abs(range);
}

// ---------------------------------------------------------------------------
// Usage examples
// ---------------------------------------------------------------------------

if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
  // Quick sanity checks (only in non-production)
  console.assert(clamp(5, 0, 10) === 5);
  console.assert(clamp(-3, 0, 10) === 0);
  console.assert(clamp(42, 0, 10) === 10);
  console.assert(clamp(5, 10, 0) === 5);
  console.assert(normalize(25, 0, 100) === 0.25);
}
