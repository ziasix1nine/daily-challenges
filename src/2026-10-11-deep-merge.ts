/**
 * Deeply merge one or more source objects into a target object.
 * Arrays are concatenated (not replaced) by default.
 * Primitive values and null/undefined are overwritten.
 * Circular references are handled by tracking visited objects.
 *
 * @example
 * const a = { user: { name: "Ada", prefs: { theme: "dark" } }, tags: ["js"] };
 * const b = { user: { prefs: { lang: "en" } }, tags: ["ts"] };
 * deepMerge(a, b);
 * // { user: { name: "Ada", prefs: { theme: "dark", lang: "en" } }, tags: ["js", "ts"] }
 */

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

type MergeOptions = {
  /** When true, arrays are replaced instead of concatenated. Default: false */
  replaceArrays?: boolean;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object") return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * Recursively merge `sources` into `target`.
 * Mutates and returns the target object.
 */
export function deepMerge<T extends Record<string, unknown>>(
  target: T,
  ...sources: Array<DeepPartial<T> | null | undefined>
): T;
export function deepMerge<T extends Record<string, unknown>>(
  target: T,
  options: MergeOptions,
  ...sources: Array<DeepPartial<T> | null | undefined>
): T;
export function deepMerge<T extends Record<string, unknown>>(
  target: T,
  optionsOrSource?: MergeOptions | DeepPartial<T> | null,
  ...rest: Array<DeepPartial<T> | null | undefined>
): T {
  const options: MergeOptions =
    optionsOrSource && isPlainObject(optionsOrSource) && ("replaceArrays" in optionsOrSource)
      ? (optionsOrSource as MergeOptions)
      : {};

  const sources =
    optionsOrSource && isPlainObject(optionsOrSource) && ("replaceArrays" in optionsOrSource)
      ? rest
      : [optionsOrSource as DeepPartial<T> | null | undefined, ...rest];

  const seen = new WeakMap<object, unknown>();

  function merge(dest: Record<string, unknown>, src: unknown): void {
    if (src == null || typeof src !== "object") return;

    if (seen.has(src as object)) {
      // Circular reference — skip or copy reference as needed
      return;
    }
    seen.set(src as object, dest);

    if (Array.isArray(src)) {
      if (!Array.isArray(dest)) {
        // Replace non-array with array
        Object.keys(dest).forEach((k) => delete dest[k]);
        Object.assign(dest, src);
        return;
      }
      if (options.replaceArrays) {
        dest.length = 0;
        dest.push(...(src as unknown[]));
      } else {
        dest.push(...(src as unknown[]));
      }
      return;
    }

    if (!isPlainObject(src)) return;

    for (const key of Object.keys(src)) {
      const srcVal = (src as Record<string, unknown>)[key];
      const destVal = dest[key];

      if (srcVal == null) {
        dest[key] = srcVal as unknown;
        continue;
      }

      if (Array.isArray(srcVal)) {
        if (options.replaceArrays || !Array.isArray(destVal)) {
          dest[key] = [...srcVal];
        } else {
          (destVal as unknown[]).push(...srcVal);
        }
        continue;
      }

      if (isPlainObject(srcVal)) {
        if (!isPlainObject(destVal)) {
          dest[key] = {};
        }
        merge(dest[key] as Record<string, unknown>, srcVal);
        continue;
      }

      // Primitive or other type — overwrite
      dest[key] = srcVal;
    }
  }

  for (const source of sources) {
    if (source != null) {
      merge(target, source);
    }
  }

  return target;
}

// Example usage:
const base = {
  app: {
    name: "MyApp",
    features: { darkMode: true },
  },
  tags: ["frontend"],
};

const override = {
  app: {
    features: { analytics: false },
    version: "1.2.0",
  },
  tags: ["typescript"],
};

const merged = deepMerge(structuredClone(base), override);
console.log(merged);
// {
//   app: {
//     name: "MyApp",
//     features: { darkMode: true, analytics: false },
//     version: "1.2.0"
//   },
//   tags: ["frontend", "typescript"]
// }
