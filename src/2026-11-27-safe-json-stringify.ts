/**
 * Safely stringifies a value to JSON, handling circular references,
 * BigInt, and other edge cases that cause JSON.stringify to throw.
 *
 * Returns `undefined` if serialization fails completely.
 *
 * @param value - Any value to serialize
 * @param space - Optional indentation (same as JSON.stringify)
 * @returns A JSON string, or undefined on failure
 *
 * @example
 * ```ts
 * const circular: any = { a: 1 };
 * circular.self = circular;
 *
 * console.log(safeJsonStringify(circular));
 * // => '{"a":1,"self":"[Circular]"}'
 *
 * console.log(safeJsonStringify({ big: 1n }));
 * // => '{"big":"1"}'
 * ```
 */
export function safeJsonStringify(
  value: unknown,
  space?: string | number
): string | undefined {
  const seen = new WeakSet();

  try {
    return JSON.stringify(
      value,
      (_key, val) => {
        if (typeof val === 'bigint') {
          return val.toString();
        }

        if (typeof val === 'object' && val !== null) {
          if (seen.has(val)) {
            return '[Circular]';
          }
          seen.add(val);
        }

        return val;
      },
      space
    );
  } catch {
    return undefined;
  }
}

// Usage example
if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
  const obj: any = { name: 'Grok', count: 42n };
  obj.self = obj;

  console.log(safeJsonStringify(obj, 2));
  // {
  //   "name": "Grok",
  //   "count": "42",
  //   "self": "[Circular]"
  // }
}
