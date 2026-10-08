/**
 * Split an array into fixed-size chunks.
 *
 * Useful for pagination, grid layouts, batching API writes, and
 * rendering long lists in pages without mutating the source.
 *
 * @example
 * chunk([1, 2, 3, 4, 5], 2);
 * // => [[1, 2], [3, 4], [5]]
 */
export function chunk<T>(items: readonly T[], size: number): T[][] {
  if (!Number.isInteger(size) || size < 1) {
    throw new RangeError(`chunk size must be a positive integer, received ${size}`);
  }

  if (items.length === 0) return [];

  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

export interface ChunkPages<T> {
  pages: T[][];
  pageCount: number;
  pageSize: number;
  total: number;
}

/** Build page metadata around {@link chunk}. Page indexes are 0-based. */
export function paginate<T>(items: readonly T[], pageSize: number): ChunkPages<T> {
  const pages = chunk(items, pageSize);
  return {
    pages,
    pageCount: pages.length,
    pageSize,
    total: items.length,
  };
}

/** Return one page, or an empty array when the index is out of range. */
export function pageAt<T>(items: readonly T[], pageSize: number, pageIndex: number): T[] {
  if (!Number.isInteger(pageIndex) || pageIndex < 0) return [];
  const start = pageIndex * pageSize;
  if (start >= items.length) return [];
  return items.slice(start, start + pageSize);
}

// Usage
const inventory = ["a", "b", "c", "d", "e", "f", "g"];
const pages = paginate(inventory, 3);
console.log(pages.pages);
// [["a", "b", "c"], ["d", "e", "f"], ["g"]]
console.log(pageAt(inventory, 3, 1));
// ["d", "e", "f"]
