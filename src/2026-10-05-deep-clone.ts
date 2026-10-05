/**
 * Deep clone for plain data used in frontend state.
 *
 * Copies objects, arrays, Date, RegExp, Map, Set, and typed arrays.
 * Circular references are preserved. Functions and class instances are
 * returned as-is (they are not plain data).
 *
 * @example
 * const original = { tags: ["a"], created: new Date() };
 * const copy = deepClone(original);
 * copy.tags.push("b");
 * // original.tags is still ["a"]
 */

export function deepClone<T>(value: T, seen: WeakMap<object, unknown> = new WeakMap()): T {
  if (value === null || typeof value !== "object") {
    return value;
  }

  if (seen.has(value)) {
    return seen.get(value) as T;
  }

  if (value instanceof Date) {
    return new Date(value.getTime()) as T;
  }

  if (value instanceof RegExp) {
    return new RegExp(value.source, value.flags) as T;
  }

  if (value instanceof Map) {
    const copy = new Map();
    seen.set(value, copy);
    value.forEach((entryValue, key) => {
      copy.set(deepClone(key, seen), deepClone(entryValue, seen));
    });
    return copy as T;
  }

  if (value instanceof Set) {
    const copy = new Set();
    seen.set(value, copy);
    value.forEach((entry) => {
      copy.add(deepClone(entry, seen));
    });
    return copy as T;
  }

  if (ArrayBuffer.isView(value) && !(value instanceof DataView)) {
    return new (value.constructor as new (buffer: ArrayBuffer) => T)(
      (value as unknown as ArrayBufferView).buffer.slice(0)
    );
  }

  if (Array.isArray(value)) {
    const copy: unknown[] = [];
    seen.set(value, copy);
    for (const item of value) {
      copy.push(deepClone(item, seen));
    }
    return copy as T;
  }

  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    return value;
  }

  const copy: Record<string, unknown> = {};
  seen.set(value, copy);
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor) continue;
    if ("value" in descriptor) {
      copy[key as string] = deepClone(descriptor.value, seen);
    }
  }
  return copy as T;
}

const sample = {
  id: 1,
  meta: { labels: ["ui", "draft"] },
  updatedAt: new Date("2026-10-05T00:00:00.000Z"),
};
sample.meta.labels.push("cloned");
const cloned = deepClone({
  id: 1,
  meta: { labels: ["ui", "draft"] },
  updatedAt: new Date("2026-10-05T00:00:00.000Z"),
});
cloned.meta.labels.push("cloned");
console.log(sample.meta.labels.length === 3, cloned.meta.labels.length === 3);
