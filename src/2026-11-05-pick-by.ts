/**
 * Creates a new object composed of the properties that satisfy the predicate.
 * Similar to lodash pickBy. Useful for filtering object keys based on values or keys.
 *
 * @template T
 * @param {T} object - The source object
 * @param {(value: T[keyof T], key: keyof T) => boolean} predicate - Function to test each property
 * @returns {Partial<T>} A new object with only the properties that passed the predicate
 *
 * @example
 * const user = { name: 'Alice', age: 30, email: null, active: true };
 * const cleaned = pickBy(user, (value) => value != null);
 * // => { name: 'Alice', age: 30, active: true }
 *
 * const onlyNumbers = pickBy({ a: 1, b: 'two', c: 3 }, (v) => typeof v === 'number');
 * // => { a: 1, c: 3 }
 */
export function pickBy<T extends Record<string, unknown>>(
  object: T,
  predicate: (value: T[keyof T], key: keyof T) => boolean
): Partial<T> {
  const result: Partial<T> = {};

  for (const key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      const value = object[key];
      if (predicate(value, key as keyof T)) {
        result[key as keyof T] = value;
      }
    }
  }

  return result;
}

/**
 * Opposite of pickBy — keeps only properties that do NOT satisfy the predicate.
 */
export function omitBy<T extends Record<string, unknown>>(
  object: T,
  predicate: (value: T[keyof T], key: keyof T) => boolean
): Partial<T> {
  return pickBy(object, (value, key) => !predicate(value, key));
}

// Usage example
if (typeof window !== 'undefined') {
  const data = {
    id: 42,
    name: 'Zia',
    email: undefined,
    role: 'dev',
    temp: null,
  };

  const valid = pickBy(data, (v) => v != null);
  console.log('Picked non-null:', valid);

  const noUndefined = omitBy(data, (v) => v === undefined);
  console.log('Omitted undefined:', noUndefined);
}
