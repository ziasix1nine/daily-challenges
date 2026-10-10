/**
 * Return a new array with duplicate values removed, preserving the first occurrence.
 * Works for primitives and for objects when a key selector is provided.
 *
 * @example
 * unique([1, 2, 2, 3, 1]);           // [1, 2, 3]
 * uniqueBy(users, (u) => u.id);      // unique by id
 * uniqueBy(users, "email");           // unique by property
 */

/**
 * Remove duplicate primitive values. First occurrence is kept.
 */
export function unique<T>(items: readonly T[]): T[] {
  return Array.from(new Set(items));
}

/**
 * Remove duplicates according to a key. The first item with a given key is kept.
 * `key` may be a property name or a selector function.
 */
export function uniqueBy<T, K>(
  items: readonly T[],
  key: ((item: T, index: number) => K) | keyof T,
): T[] {
  const seen = new Set<K>();
  const result: T[] = [];
  const getKey = typeof key === "function"
    ? key
    : (item: T) => item[key] as K;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const k = getKey(item, i);
    if (!seen.has(k)) {
      seen.add(k);
      result.push(item);
    }
  }

  return result;
}

/**
 * Return items that appear in `source` but not in `exclude`, using optional key equality.
 */
export function difference<T, K = T>(
  source: readonly T[],
  exclude: readonly T[],
  key?: ((item: T) => K) | keyof T,
): T[] {
  if (!key) {
    const excludeSet = new Set(exclude as readonly unknown[]);
    return source.filter((item) => !excludeSet.has(item as unknown));
  }

  const getKey = typeof key === "function"
    ? key
    : (item: T) => item[key] as K;

  const excludeKeys = new Set(exclude.map(getKey));
  return source.filter((item) => !excludeKeys.has(getKey(item)));
}

// Example:
const products = [
  { id: 1, name: "Keyboard" },
  { id: 2, name: "Mouse" },
  { id: 1, name: "Keyboard (duplicate)" },
  { id: 3, name: "Monitor" },
];

console.log(uniqueBy(products, "id"));
// [{ id: 1, name: "Keyboard" }, { id: 2, name: "Mouse" }, { id: 3, name: "Monitor" }]

console.log(difference([1, 2, 3, 4], [2, 4]));
// [1, 3]
