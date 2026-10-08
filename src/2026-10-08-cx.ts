/**
 * Conditional className builder, in the spirit of `clsx`.
 *
 * Accepts strings, numbers, arrays, and objects whose keys are included
 * only when the value is truthy. Falsy values and empty strings are skipped.
 *
 * @example
 * cx("btn", isActive && "btn-active", { "btn-disabled": disabled });
 * // => "btn btn-active" when isActive is true and disabled is false
 */
export type ClassValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | ClassValue[]
  | { readonly [className: string]: unknown };

export function cx(...values: ClassValue[]): string {
  const parts: string[] = [];

  const visit = (value: ClassValue): void => {
    if (value == null || value === false || value === true) return;

    if (typeof value === "string" || typeof value === "number") {
      const text = String(value).trim();
      if (text) parts.push(text);
      return;
    }

    if (Array.isArray(value)) {
      for (const item of value) visit(item);
      return;
    }

    for (const key of Object.keys(value)) {
      if (value[key]) parts.push(key);
    }
  };

  for (const value of values) visit(value);
  return parts.join(" ");
}

/**
 * Merge a base class string with conditional extras.
 * Later tokens do not remove earlier ones; this is concatenation, not Tailwind conflict resolution.
 */
export function withBase(base: string, ...extras: ClassValue[]): string {
  return cx(base, ...extras);
}

// Usage
const isActive = true;
const isDisabled = false;
const size = "lg" as "sm" | "lg";

const className = cx(
  "btn",
  isActive && "btn-active",
  { "btn-disabled": isDisabled, "btn-lg": size === "lg" },
  ["u-focus-ring", null]
);
console.log(className);
// "btn btn-active btn-lg u-focus-ring"
