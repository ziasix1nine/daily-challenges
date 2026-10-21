/**
 * Multi-key sort utility for arrays of objects or primitives.
 * Supports ascending/descending and nested property access via dot notation or functions.
 *
 * @param array - Array to sort (does not mutate original)
 * @param keys - One or more sort keys (string property path or getter function)
 * @param directions - Optional 'asc' | 'desc' for each key (defaults to all 'asc')
 * @returns New sorted array
 *
 * @example
 * ```ts
 * const users = [
 *   { name: 'Bob', age: 30, score: 85 },
 *   { name: 'Alice', age: 25, score: 92 },
 *   { name: 'Charlie', age: 30, score: 78 },
 * ];
 *
 * const sorted = sortBy(users, ['age', 'score'], ['asc', 'desc']);
 * // [{ name: 'Alice', age: 25, score: 92 }, { name: 'Bob', age: 30, score: 85 }, ...]
 * ```
 */

type SortKey<T> = string | ((item: T) => string | number | boolean | Date | null | undefined);
type SortDirection = 'asc' | 'desc';

function getValue<T>(item: T, key: SortKey<T>): unknown {
  if (typeof key === 'function') {
    return key(item);
  }
  // Support simple dot notation
  return key.split('.').reduce((obj: any, k) => (obj == null ? undefined : obj[k]), item);
}

function compare(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;

  if (typeof a === 'string' && typeof b === 'string') {
    return a.localeCompare(b);
  }

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() - b.getTime();
  }

  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }

  return String(a).localeCompare(String(b));
}

export function sortBy<
  T,
  K extends SortKey<T> | readonly SortKey<T>[]
>(
  array: readonly T[],
  keys: K,
  directions?: SortDirection | readonly SortDirection[]
): T[] {
  const keyList = (Array.isArray(keys) ? keys : [keys]) as SortKey<T>[];
  const dirList = Array.isArray(directions)
    ? directions
    : directions
      ? [directions]
      : [];

  return [...array].sort((a, b) => {
    for (let i = 0; i < keyList.length; i++) {
      const key = keyList[i];
      const dir = dirList[i] ?? 'asc';
      const aVal = getValue(a, key);
      const bVal = getValue(b, key);
      const cmp = compare(aVal, bVal);
      if (cmp !== 0) {
        return dir === 'desc' ? -cmp : cmp;
      }
    }
    return 0;
  });
}

// Usage example:
const products = [
  { name: 'Laptop', price: 1200, rating: 4.5 },
  { name: 'Phone', price: 800, rating: 4.8 },
  { name: 'Tablet', price: 600, rating: 4.5 },
  { name: 'Headphones', price: 150, rating: 4.2 },
];

const byPriceAsc = sortBy(products, 'price');
console.log('By price (asc):', byPriceAsc.map(p => `${p.name}: $${p.price}`));

const byRatingThenPrice = sortBy(
  products,
  ['rating', 'price'],
  ['desc', 'asc']
);
console.log(
  'By rating (desc) then price (asc):',
  byRatingThenPrice.map(p => `${p.name} (${p.rating}) - $${p.price}`)
);

const byNameLength = sortBy(products, (p) => p.name.length, 'desc');
console.log('By name length (desc):', byNameLength.map(p => p.name));
