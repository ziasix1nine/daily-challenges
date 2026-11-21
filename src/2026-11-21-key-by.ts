/**
 * Creates an object composed of keys generated from the results of running each element of collection thru iteratee.
 * The corresponding value of each key is the last element responsible for generating the key.
 *
 * Useful for indexing arrays of objects by a property or computed key.
 *
 * @template T - Type of items in the collection
 * @template K - Type of the generated key (string | number | symbol)
 * @param collection - The array to iterate over
 * @param iteratee - Function invoked per element to generate the key
 * @returns Object with keys from iteratee and values as the original items
 *
 * @example
 * const users = [
 *   { id: 'a1', name: 'Alice' },
 *   { id: 'b2', name: 'Bob' },
 *   { id: 'a1', name: 'Alice Duplicate' } // last one wins
 * ];
 * const byId = keyBy(users, user => user.id);
 * // { a1: { id: 'a1', name: 'Alice Duplicate' }, b2: { id: 'b2', name: 'Bob' } }
 */
export function keyBy<T, K extends PropertyKey>(
  collection: readonly T[],
  iteratee: (item: T, index: number, array: readonly T[]) => K
): Record<K, T> {
  const result = {} as Record<K, T>;

  for (let i = 0; i < collection.length; i++) {
    const item = collection[i];
    const key = iteratee(item, i, collection);
    result[key] = item;
  }

  return result;
}

/**
 * Overload for keying by a direct property name (shorthand).
 */
export function keyByProperty<T, K extends keyof T>(
  collection: readonly T[],
  key: K
): Record<T[K] & PropertyKey, T> {
  return keyBy(collection, (item) => item[key] as T[K] & PropertyKey);
}

// Usage example
if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
  const people = [
    { id: 1, name: 'Alice', role: 'admin' },
    { id: 2, name: 'Bob', role: 'user' },
    { id: 3, name: 'Charlie', role: 'user' },
  ];

  const byId = keyBy(people, (p) => p.id);
  console.log(byId[2].name); // 'Bob'

  const byRole = keyBy(people, (p) => p.role);
  // Last user with role 'user' overwrites previous
  console.log(Object.keys(byRole)); // ['admin', 'user']
}
