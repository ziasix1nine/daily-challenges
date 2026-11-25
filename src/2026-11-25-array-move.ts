/**
 * Moves an item in an array from one index to another, returning a new array.
 * Does not mutate the original array.
 *
 * @param array - The source array
 * @param fromIndex - The index of the item to move
 * @param toIndex - The target index to move the item to
 * @returns A new array with the item moved
 *
 * @example
 * const arr = ['a', 'b', 'c', 'd'];
 * arrayMove(arr, 0, 2); // ['b', 'c', 'a', 'd']
 * arrayMove(arr, 3, 1); // ['a', 'd', 'b', 'c']
 */
export function arrayMove<T>(array: readonly T[], fromIndex: number, toIndex: number): T[] {
  const length = array.length;

  if (length === 0) {
    return [];
  }

  // Normalize negative indices
  const from = fromIndex < 0 ? Math.max(length + fromIndex, 0) : Math.min(fromIndex, length - 1);
  const to = toIndex < 0 ? Math.max(length + toIndex, 0) : Math.min(toIndex, length - 1);

  if (from === to) {
    return array.slice();
  }

  const result = array.slice();
  const [item] = result.splice(from, 1);
  result.splice(to, 0, item);

  return result;
}

// Usage example:
// const items = ['apple', 'banana', 'cherry', 'date'];
// const reordered = arrayMove(items, 1, 3);
// console.log(reordered); // ['apple', 'cherry', 'date', 'banana']
// console.log(items); // original unchanged
