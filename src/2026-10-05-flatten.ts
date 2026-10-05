/**
 * Flatten nested arrays to a given depth.
 *
 * Depth 1 flattens one level. Infinity flattens completely.
 * Holes in sparse arrays are skipped, matching Array.prototype.flat.
 *
 * @example
 * flatten([1, [2, [3, [4]]]], 2);
 * // [1, 2, 3, [4]]
 *
 * flatten([1, [2, [3]]], Infinity);
 * // [1, 2, 3]
 */

export function flatten<T>(input: readonly unknown[], depth: number = 1): T[] {
  if (!Number.isInteger(depth) && depth !== Infinity) {
    throw new RangeError("depth must be an integer or Infinity");
  }
  if (depth < 0) {
    throw new RangeError("depth must be >= 0");
  }

  const result: T[] = [];

  const walk = (value: unknown, remaining: number): void => {
    if (remaining > 0 && Array.isArray(value)) {
      for (let index = 0; index < value.length; index += 1) {
        if (!Object.prototype.hasOwnProperty.call(value, index)) continue;
        walk(value[index], remaining - 1);
      }
      return;
    }
    result.push(value as T);
  };

  walk(input, depth + 1);
  return result;
}

/** Group items that fail a predicate into the left bucket, the rest into the right. */
export function partition<T>(items: readonly T[], predicate: (item: T, index: number) => boolean): [T[], T[]] {
  const matched: T[] = [];
  const rest: T[] = [];
  items.forEach((item, index) => {
    (predicate(item, index) ? matched : rest).push(item);
  });
  return [matched, rest];
}

const nested = [1, [2, [3, [4]]], 5];
console.log(flatten<number | number[]>(nested, 2));
console.log(flatten<number>(nested, Infinity));

const [even, odd] = partition([1, 2, 3, 4], (n) => n % 2 === 0);
console.log(even, odd);
