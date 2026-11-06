/**
 * Removes falsy values from an array (null, undefined, false, 0, '', NaN).
 * Returns a new array with only truthy values, preserving original type where possible.
 *
 * @example
 * compact([0, 1, false, 2, '', 3, null, undefined, NaN]);
 * // => [1, 2, 3]
 */
export function compact<T>(array: readonly (T | null | undefined | false | 0 | '' | typeof NaN)[]): T[] {
  return array.filter(Boolean) as T[];
}

/**
 * Type-safe version that only removes null and undefined.
 */
export function compactNil<T>(array: readonly (T | null | undefined)[]): T[] {
  return array.filter((item): item is T => item != null);
}

// Usage example:
const mixed = [0, 1, false, 2, '', 3, null, undefined];
console.log(compact(mixed)); // [1, 2, 3]
console.log(compactNil([1, null, 2, undefined, 3])); // [1, 2, 3]
