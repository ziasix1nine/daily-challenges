/**
 * Array set operations: difference and intersection.
 * Useful for comparing lists without external libraries.
 *
 * @example
 * ```ts
 * const a = [1, 2, 3, 4];
 * const b = [3, 4, 5, 6];
 * difference(a, b);   // [1, 2]
 * intersection(a, b); // [3, 4]
 * ```
 */

/**
 * Returns elements that exist in the first array but not in the second.
 * Preserves order of the first array. Uses strict equality.
 */
export function difference<T>(a: readonly T[], b: readonly T[]): T[] {
  const setB = new Set(b);
  return a.filter((item) => !setB.has(item));
}

/**
 * Returns elements that exist in both arrays.
 * Preserves order of the first array. Uses strict equality.
 */
export function intersection<T>(a: readonly T[], b: readonly T[]): T[] {
  const setB = new Set(b);
  return a.filter((item) => setB.has(item));
}

/**
 * Returns elements that exist in either array but not both (symmetric difference).
 */
export function symmetricDifference<T>(a: readonly T[], b: readonly T[]): T[] {
  return [...difference(a, b), ...difference(b, a)];
}

// Usage example:
const usersA = ['alice', 'bob', 'charlie'];
const usersB = ['bob', 'dave', 'alice'];

console.log(difference(usersA, usersB));          // ['charlie']
console.log(intersection(usersA, usersB));        // ['alice', 'bob']
console.log(symmetricDifference(usersA, usersB)); // ['charlie', 'dave']

const numsA = [1, 2, 2, 3];
const numsB = [2, 3, 4];
console.log(difference(numsA, numsB));   // [1]
console.log(intersection(numsA, numsB)); // [2, 2, 3] — note: duplicates from first array kept
