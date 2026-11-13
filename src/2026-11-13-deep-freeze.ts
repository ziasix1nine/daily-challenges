/**
 * Deeply freezes an object and all nested objects/arrays.
 * Prevents mutation of the object and its nested properties.
 *
 * Useful for creating immutable configuration objects or state snapshots.
 *
 * @template T
 * @param {T} obj - The value to freeze (object, array, or primitive)
 * @returns {Readonly<T>} The same reference, now deeply frozen
 *
 * @example
 * const config = deepFreeze({
 *   api: { baseUrl: 'https://api.example.com', timeout: 5000 },
 *   features: ['search', 'filter']
 * });
 *
 * // config.api.timeout = 1000; // TypeError in strict mode
 * // config.features.push('sort'); // TypeError in strict mode
 */
export function deepFreeze<T>(obj: T): Readonly<T> {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // Freeze the current object/array
  Object.freeze(obj);

  // Recursively freeze own properties
  const props = Object.getOwnPropertyNames(obj);
  for (const prop of props) {
    const value = (obj as any)[prop];
    if (
      value !== null &&
      typeof value === 'object' &&
      !Object.isFrozen(value)
    ) {
      deepFreeze(value);
    }
  }

  return obj as Readonly<T>;
}

// Usage example
const sample = {
  user: {
    name: 'Ada',
    settings: { theme: 'dark', notifications: true }
  },
  tags: ['typescript', 'immutable', { nested: true }]
};

const frozen = deepFreeze(sample);

console.log('Is frozen:', Object.isFrozen(frozen));
console.log('Nested frozen:', Object.isFrozen(frozen.user.settings));
console.log('Array frozen:', Object.isFrozen(frozen.tags));

// The following would throw in strict mode:
// (frozen as any).user.name = 'Grace';
// (frozen as any).tags.push('new');
