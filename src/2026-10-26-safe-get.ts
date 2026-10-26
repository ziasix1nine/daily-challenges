/**
 * Safely read a nested property from an object using a path string or array of keys.
 * Returns the default value (or undefined) if any part of the path is missing or null/undefined.
 *
 * Useful for reading deeply nested API responses or configuration without a chain of optional chaining.
 *
 * @example
 * const data = { user: { profile: { name: "Ada" } } };
 * get(data, "user.profile.name");          // "Ada"
 * get(data, ["user", "profile", "age"], 0); // 0
 * get(null, "a.b");                        // undefined
 */

export type Path = string | readonly (string | number)[];

function toKeys(path: Path): (string | number)[] {
  if (Array.isArray(path)) return [...path];
  return path
    .replace(/\[(\d+)\]/g, ".$1") // convert [0] to .0
    .split(".")
    .filter(Boolean)
    .map((key) => (/^\d+$/.test(key) ? Number(key) : key));
}

export function get<
  T = unknown,
  D = undefined,
>(
  object: unknown,
  path: Path,
  defaultValue?: D,
): T | D {
  if (object == null || path == null || path === "") {
    return defaultValue as D;
  }

  const keys = toKeys(path);
  let current: unknown = object;

  for (const key of keys) {
    if (current == null || typeof current !== "object") {
      return defaultValue as D;
    }
    current = (current as Record<string | number, unknown>)[key];
  }

  return (current === undefined ? defaultValue : current) as T | D;
}

/**
 * Type-safe variant that narrows when a default is provided.
 * Prefer the main `get` for most cases.
 */
export function getOr<
  T,
  D,
>(object: unknown, path: Path, defaultValue: D): T | D {
  return get<T, D>(object, path, defaultValue);
}

// Example:
// const response = {
//   data: {
//     users: [{ id: 1, name: "Ada" }, { id: 2, name: "Grace" }],
//   },
// };
//
// console.log(get(response, "data.users[0].name")); // "Ada"
// console.log(get(response, "data.users.1.name"));  // "Grace"
// console.log(get(response, "data.missing.key", "fallback")); // "fallback"
