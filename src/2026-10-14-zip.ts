/**
 * Zips multiple arrays together into an array of tuples.
 * Stops at the shortest array length. Useful for pairing data from multiple sources.
 *
 * @example
 * zip([1, 2, 3], ['a', 'b', 'c'])
 * // => [[1, 'a'], [2, 'b'], [3, 'c']]
 *
 * zip([1, 2], ['a', 'b', 'c'], [true])
 * // => [[1, 'a', true]]
 */
export function zip<T extends readonly (readonly unknown[])[]>(
  ...arrays: T
): { [K in keyof T]: T[K] extends readonly (infer U)[] ? U : never }[] {
  if (arrays.length === 0) return [];

  const minLength = Math.min(...arrays.map((arr) => arr.length));
  const result: any[] = [];

  for (let i = 0; i < minLength; i++) {
    result.push(arrays.map((arr) => arr[i]));
  }

  return result;
}

// Usage example:
const ids = [1, 2, 3];
const names = ['Alice', 'Bob', 'Charlie'];
const active = [true, false, true];

const users = zip(ids, names, active);
// users = [[1, 'Alice', true], [2, 'Bob', false], [3, 'Charlie', true]]

console.log(users);
