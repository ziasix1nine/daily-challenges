/**
 * Function composition utilities: `pipe` (left-to-right) and `compose` (right-to-left).
 *
 * Both accept a sequence of unary functions and return a single function that
 * applies them in order. Overloads keep the input/output types intact for the
 * common 1–6 function case; a rest-parameter fallback covers longer pipelines.
 *
 * @example
 * const double = (n: number) => n * 2;
 * const toString = (n: number) => String(n);
 * const shout = (s: string) => s + '!';
 *
 * pipe(double, toString, shout)(21);      // "42!"
 * compose(shout, toString, double)(21);   // "42!"
 */

export type Unary<A, B> = (value: A) => B;

export function pipe<A>(value: A): A;
export function pipe<A, B>(ab: Unary<A, B>): Unary<A, B>;
export function pipe<A, B, C>(ab: Unary<A, B>, bc: Unary<B, C>): Unary<A, C>;
export function pipe<A, B, C, D>(
  ab: Unary<A, B>,
  bc: Unary<B, C>,
  cd: Unary<C, D>,
): Unary<A, D>;
export function pipe<A, B, C, D, E>(
  ab: Unary<A, B>,
  bc: Unary<B, C>,
  cd: Unary<C, D>,
  de: Unary<D, E>,
): Unary<A, E>;
export function pipe<A, B, C, D, E, F>(
  ab: Unary<A, B>,
  bc: Unary<B, C>,
  cd: Unary<C, D>,
  de: Unary<D, E>,
  ef: Unary<E, F>,
): Unary<A, F>;
export function pipe<A, B, C, D, E, F, G>(
  ab: Unary<A, B>,
  bc: Unary<B, C>,
  cd: Unary<C, D>,
  de: Unary<D, E>,
  ef: Unary<E, F>,
  fg: Unary<F, G>,
): Unary<A, G>;
export function pipe(
  ...fns: Array<Unary<unknown, unknown>>
): Unary<unknown, unknown> {
  return (input: unknown) => fns.reduce((acc, fn) => fn(acc), input);
}

export function compose<A>(value: A): A;
export function compose<A, B>(ab: Unary<A, B>): Unary<A, B>;
export function compose<A, B, C>(bc: Unary<B, C>, ab: Unary<A, B>): Unary<A, C>;
export function compose<A, B, C, D>(
  cd: Unary<C, D>,
  bc: Unary<B, C>,
  ab: Unary<A, B>,
): Unary<A, D>;
export function compose<A, B, C, D, E>(
  de: Unary<D, E>,
  cd: Unary<C, D>,
  bc: Unary<B, C>,
  ab: Unary<A, B>,
): Unary<A, E>;
export function compose<A, B, C, D, E, F>(
  ef: Unary<E, F>,
  de: Unary<D, E>,
  cd: Unary<C, D>,
  bc: Unary<B, C>,
  ab: Unary<A, B>,
): Unary<A, F>;
export function compose<A, B, C, D, E, F, G>(
  fg: Unary<F, G>,
  ef: Unary<E, F>,
  de: Unary<D, E>,
  cd: Unary<C, D>,
  bc: Unary<B, C>,
  ab: Unary<A, B>,
): Unary<A, G>;
export function compose(
  ...fns: Array<Unary<unknown, unknown>>
): Unary<unknown, unknown> {
  return (input: unknown) => fns.reduceRight((acc, fn) => fn(acc), input);
}

/** Apply `fns` left-to-right to a concrete starting value. */
export function pipeValue<A, B>(value: A, ab: Unary<A, B>): B;
export function pipeValue<A, B, C>(value: A, ab: Unary<A, B>, bc: Unary<B, C>): C;
export function pipeValue<A, B, C, D>(
  value: A,
  ab: Unary<A, B>,
  bc: Unary<B, C>,
  cd: Unary<C, D>,
): D;
export function pipeValue(
  value: unknown,
  ...fns: Array<Unary<unknown, unknown>>
): unknown {
  return fns.reduce((acc, fn) => fn(acc), value);
}

// ---------------------------------------------------------------------------
// Usage example (run with: npx tsx src/2026-09-30-compose-pipe.ts)
// ---------------------------------------------------------------------------

if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  const trim = (s: string) => s.trim();
  const words = (s: string) => s.split(/\s+/).filter(Boolean);
  const count = (arr: unknown[]) => arr.length;

  const wordCount = pipe(trim, words, count);
  const wordCountRtl = compose(count, words, trim);

  const sample = '  compose and pipe keep pipelines readable  ';
  console.log('pipe:', wordCount(sample));           // 6
  console.log('compose:', wordCountRtl(sample));     // 6
  console.log('pipeValue:', pipeValue(sample, trim, words, count)); // 6
}
