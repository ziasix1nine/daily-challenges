/**
 * Type-safe object utilities: pick and omit specific keys.
 * Useful for selecting subsets of objects without mutation.
 *
 * @example
 * ```ts
 * const user = { id: 1, name: 'Alice', email: 'a@example.com', password: 'secret' };
 * const publicUser = pick(user, ['id', 'name']); // { id: 1, name: 'Alice' }
 * const safe = omit(user, ['password']); // { id: 1, name: 'Alice', email: 'a@example.com' }
 * ```
 */

type PickKeys<T, K extends keyof T> = Pick<T, K>;
type OmitKeys<T, K extends keyof T> = Omit<T, K>;

/**
 * Creates a new object with only the specified keys from the source object.
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: readonly K[]
): PickKeys<T, K> {
  const result = {} as PickKeys<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * Creates a new object excluding the specified keys from the source object.
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: readonly K[]
): OmitKeys<T, K> {
  const result = { ...obj } as T;
  for (const key of keys) {
    delete result[key];
  }
  return result as OmitKeys<T, K>;
}

// Usage example:
const person = {
  id: 42,
  name: 'Zia',
  email: 'zia@example.com',
  role: 'admin',
  password: 'hashed',
};

const publicProfile = pick(person, ['id', 'name', 'role'] as const);
console.log(publicProfile); // { id: 42, name: 'Zia', role: 'admin' }

const withoutSensitive = omit(person, ['password'] as const);
console.log(withoutSensitive); // { id: 42, name: 'Zia', email: 'zia@example.com', role: 'admin' }
