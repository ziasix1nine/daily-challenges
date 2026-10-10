/**
 * Split an array into two groups based on a predicate.
 * Items that satisfy the predicate go into `pass`, the rest into `fail`.
 *
 * Useful for filtering while keeping the rejected items (e.g. valid vs invalid form fields).
 *
 * @example
 * const numbers = [1, 2, 3, 4, 5];
 * const { pass, fail } = partition(numbers, (n) => n % 2 === 0);
 * // pass: [2, 4]
 * // fail: [1, 3, 5]
 */

export interface PartitionResult<T> {
  pass: T[];
  fail: T[];
}

/**
 * Partition `items` into two arrays according to `predicate`.
 * The original array is not mutated.
 */
export function partition<T>(
  items: readonly T[],
  predicate: (item: T, index: number) => boolean,
): PartitionResult<T> {
  const pass: T[] = [];
  const fail: T[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (predicate(item, i)) {
      pass.push(item);
    } else {
      fail.push(item);
    }
  }

  return { pass, fail };
}

/**
 * Convenience: partition by a truthy/falsy property or computed value.
 */
export function partitionBy<T, K extends PropertyKey>(
  items: readonly T[],
  key: ((item: T) => K) | keyof T,
  truthyKeys: readonly K[] = [true as unknown as K],
): PartitionResult<T> {
  const getKey = typeof key === "function" ? key : (item: T) => item[key] as K;
  const truthy = new Set(truthyKeys);

  return partition(items, (item) => truthy.has(getKey(item)));
}

// Example usage:
const users = [
  { name: "Ada", active: true },
  { name: "Bob", active: false },
  { name: "Eve", active: true },
];

const { pass: active, fail: inactive } = partition(users, (u) => u.active);
console.log({ active, inactive });
