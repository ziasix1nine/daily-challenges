/**
 * Maps over the values of an object, returning a new object with the same keys
 * and transformed values. Analogous to `Array.prototype.map` but for plain objects.
 *
 * @template T - Original value type
 * @template U - Transformed value type
 * @param obj - The source object
 * @param mapper - Function that receives the value and key and returns the new value
 * @returns A new object with the same keys and mapped values
 *
 * @example
 * ```ts
 * const scores = { alice: 85, bob: 92, carol: 78 };
 *
 * const grades = mapObject(scores, (score) =>
 *   score >= 90 ? 'A' : score >= 80 ? 'B' : 'C'
 * );
 * // => { alice: 'B', bob: 'A', carol: 'C' }
 *
 * const doubled = mapObject({ a: 1, b: 2 }, (n, key) => n * 2);
 * // => { a: 2, b: 4 }
 * ```
 */
export function mapObject<T, U>(
  obj: Record<string, T>,
  mapper: (value: T, key: string) => U
): Record<string, U> {
  const result: Record<string, U> = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = mapper(obj[key], key);
    }
  }

  return result;
}

// Usage example
if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
  const users = {
    user1: { name: 'Alice', age: 30 },
    user2: { name: 'Bob', age: 25 },
  };

  const names = mapObject(users, (user) => user.name);
  console.log(names);
  // => { user1: 'Alice', user2: 'Bob' }

  const agesNextYear = mapObject(users, (user) => user.age + 1);
  console.log(agesNextYear);
  // => { user1: 31, user2: 26 }
}
