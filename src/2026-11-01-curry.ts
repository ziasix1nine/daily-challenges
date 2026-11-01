/**
 * Currying utility for JavaScript/TypeScript.
 * Transforms a function so it can be called with arguments one at a time
 * (or in any partial order) until all arguments are provided.
 *
 * Useful for functional composition, partial application, and point-free style.
 *
 * @example
 * const add = (a: number, b: number, c: number) => a + b + c;
 * const curriedAdd = curry(add);
 * curriedAdd(1)(2)(3); // 6
 * curriedAdd(1, 2)(3); // 6
 * curriedAdd(1)(2, 3); // 6
 */

type AnyFn = (...args: any[]) => any;

/**
 * Creates a curried version of the given function.
 * The returned function will keep collecting arguments until the original
 * function's arity is satisfied, then invoke it.
 *
 * Supports both full and partial applications in any combination.
 */
export function curry<F extends AnyFn>(fn: F): Curried<F> {
  const arity = fn.length;

  function curried(...args: any[]): any {
    if (args.length >= arity) {
      return fn(...args);
    }

    return (...more: any[]) => curried(...args, ...more);
  }

  return curried as Curried<F>;
}

/**
 * Type helper that produces the correct overloaded signature for a curried function.
 * Supports up to 5 arguments for practicality (extend if needed).
 */
type Curried<F extends AnyFn> = F extends (
  a: infer A,
  b: infer B,
  c: infer C,
  d: infer D,
  e: infer E
) => infer R
  ? {
      (a: A): Curried<(b: B, c: C, d: D, e: E) => R>;
      (a: A, b: B): Curried<(c: C, d: D, e: E) => R>;
      (a: A, b: B, c: C): Curried<(d: D, e: E) => R>;
      (a: A, b: B, c: C, d: D): Curried<(e: E) => R>;
      (a: A, b: B, c: C, d: D, e: E): R;
    }
  : F extends (a: infer A, b: infer B, c: infer C, d: infer D) => infer R
  ? {
      (a: A): Curried<(b: B, c: C, d: D) => R>;
      (a: A, b: B): Curried<(c: C, d: D) => R>;
      (a: A, b: B, c: C): Curried<(d: D) => R>;
      (a: A, b: B, c: C, d: D): R;
    }
  : F extends (a: infer A, b: infer B, c: infer C) => infer R
  ? {
      (a: A): Curried<(b: B, c: C) => R>;
      (a: A, b: B): Curried<(c: C) => R>;
      (a: A, b: B, c: C): R;
    }
  : F extends (a: infer A, b: infer B) => infer R
  ? {
      (a: A): (b: B) => R;
      (a: A, b: B): R;
    }
  : F extends (a: infer A) => infer R
  ? (a: A) => R
  : F;

// ---------- Usage Example ----------
const multiply = (a: number, b: number, c: number) => a * b * c;
const curriedMultiply = curry(multiply);

console.log(curriedMultiply(2)(3)(4));     // 24
console.log(curriedMultiply(2, 3)(4));     // 24
console.log(curriedMultiply(2)(3, 4));     // 24
console.log(curriedMultiply(2, 3, 4));     // 24

// Partial application for reuse
const double = curriedMultiply(2);
const tripleThen = double(3);
console.log(tripleThen(5)); // 30
