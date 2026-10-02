/**
 * Group and partition array helpers.
 *
 * groupBy buckets items by a key derived from each element.
 * partition splits an array into items that match a predicate and items that do not,
 * preserving original order in both groups.
 */

export type KeySelector<T> = (item: T, index: number) => PropertyKey;

/**
 * Group items by a key. Insertion order of keys is preserved.
 */
export function groupBy<T, K extends PropertyKey>(
  items: readonly T[],
  keyOf: (item: T, index: number) => K,
): Record<K, T[]> {
  if (!Array.isArray(items)) {
    throw new TypeError("groupBy expects an array");
  }
  if (typeof keyOf !== "function") {
    throw new TypeError("groupBy expects a key function");
  }

  const groups = new Map<K, T[]>();

  for (let i = 0; i < items.length; i++) {
    const item = items[i] as T;
    const key = keyOf(item, i);
    const bucket = groups.get(key);
    if (bucket) bucket.push(item);
    else groups.set(key, [item]);
  }

  return Object.fromEntries(groups) as Record<K, T[]>;
}

export interface PartitionResult<T> {
  /** Items for which the predicate returned true, in original order. */
  pass: T[];
  /** Items for which the predicate returned false, in original order. */
  fail: T[];
}

/**
 * Split items into two lists based on a predicate. One pass, stable order.
 */
export function partition<T>(
  items: readonly T[],
  predicate: (item: T, index: number) => boolean,
): PartitionResult<T> {
  if (!Array.isArray(items)) {
    throw new TypeError("partition expects an array");
  }
  if (typeof predicate !== "function") {
    throw new TypeError("partition expects a predicate");
  }

  const pass: T[] = [];
  const fail: T[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i] as T;
    if (predicate(item, i)) pass.push(item);
    else fail.push(item);
  }

  return { pass, fail };
}

// --- usage example ---
interface Task {
  id: string;
  status: "open" | "done";
  owner: string;
}

const tasks: Task[] = [
  { id: "a", status: "open", owner: "ada" },
  { id: "b", status: "done", owner: "ada" },
  { id: "c", status: "open", owner: "lin" },
];

const byOwner = groupBy(tasks, (task) => task.owner);
const { pass: open, fail: done } = partition(tasks, (task) => task.status === "open");

console.log(byOwner.ada.map((task) => task.id));
console.log(open.length, done.length);
