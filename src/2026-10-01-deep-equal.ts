/**
 * Structural deep equality for plain frontend data.
 *
 * Handles primitives, Date, RegExp, Array, Map, Set, and plain objects.
 * Cycles are tracked so mutually recursive structures do not overflow.
 * Object key order does not matter; array and Map/Set iteration order does.
 *
 * Not a substitute for a full equality library: functions compare by reference,
 * and class instances are compared by their enumerable own properties only
 * when both share the same constructor.
 */

export function deepEqual(a: unknown, b: unknown): boolean {
  return equal(a, b, new WeakMap());
}

function equal(a: unknown, b: unknown, seen: WeakMap<object, object>): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || typeof b !== "object") return false;
  if (a === null || b === null) return false;

  const paired = seen.get(a);
  if (paired) return paired === b;
  seen.set(a, b);

  if (a instanceof Date || b instanceof Date) {
    return a instanceof Date && b instanceof Date && a.getTime() === b.getTime();
  }

  if (a instanceof RegExp || b instanceof RegExp) {
    return a instanceof RegExp && b instanceof RegExp && a.source === b.source && a.flags === b.flags;
  }

  if (a instanceof Map || b instanceof Map) {
    if (!(a instanceof Map) || !(b instanceof Map) || a.size !== b.size) return false;
    for (const [key, value] of a) {
      if (!b.has(key) || !equal(value, b.get(key), seen)) return false;
    }
    return true;
  }

  if (a instanceof Set || b instanceof Set) {
    if (!(a instanceof Set) || !(b instanceof Set) || a.size !== b.size) return false;
    const remaining = [...b];
    for (const value of a) {
      const index = remaining.findIndex((candidate) => equal(value, candidate, seen));
      if (index === -1) return false;
      remaining.splice(index, 1);
    }
    return true;
  }

  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    return a.every((item, index) => equal(item, b[index], seen));
  }

  if (a.constructor !== b.constructor) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  const keySet = new Set(keysB);
  return keysA.every(
    (key) => keySet.has(key) && equal((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key], seen),
  );
}

// --- usage example ---
const left = {
  id: 1,
  tags: new Set(["ui", "a11y"]),
  updated: new Date("2026-10-01T00:00:00Z"),
  meta: { nested: [1, { ok: true }] },
};

const right = {
  meta: { nested: [1, { ok: true }] },
  updated: new Date("2026-10-01T00:00:00Z"),
  tags: new Set(["a11y", "ui"]),
  id: 1,
};

console.log(deepEqual(left, right)); // true
console.log(deepEqual(left, { ...right, id: 2 })); // false
