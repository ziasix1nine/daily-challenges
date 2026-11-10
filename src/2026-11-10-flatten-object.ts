/**
 * Flatten a nested object into a single-level object with dot-notation keys.
 * 
 * @example
 * flattenObject({ a: 1, b: { c: 2, d: { e: 3 } } })
 * // => { 'a': 1, 'b.c': 2, 'b.d.e': 3 }
 */
export function flattenObject(
  obj: Record<string, unknown>,
  prefix = '',
  result: Record<string, unknown> = {}
): Record<string, unknown> {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (
        value !== null &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        !(value instanceof Date)
      ) {
        flattenObject(value as Record<string, unknown>, newKey, result);
      } else {
        result[newKey] = value;
      }
    }
  }
  return result;
}

// Usage example
if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
  const nested = {
    user: {
      name: 'Alice',
      address: {
        city: 'Wonderland',
        zip: 12345,
      },
    },
    active: true,
  };

  console.log(flattenObject(nested));
  // { 'user.name': 'Alice', 'user.address.city': 'Wonderland', 'user.address.zip': 12345, active: true }
}
