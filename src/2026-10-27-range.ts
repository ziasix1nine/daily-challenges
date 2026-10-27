/**
 * range – Generate an array of numbers.
 *
 * Overloads:
 *   range(end)              → [0, 1, …, end-1]
 *   range(start, end)       → [start, …, end-1]
 *   range(start, end, step) → stepped sequence
 *
 * Handles negative steps and is safe with non-integer values
 * (rounds toward zero for the length calculation).
 *
 * @example
 * range(5)           // [0, 1, 2, 3, 4]
 * range(2, 6)        // [2, 3, 4, 5]
 * range(0, 10, 2)    // [0, 2, 4, 6, 8]
 * range(5, 0, -1)    // [5, 4, 3, 2, 1]
 * range(1.5, 5.5)    // [1.5, 2.5, 3.5, 4.5]
 */
export function range(end: number): number[];
export function range(start: number, end: number, step?: number): number[];
export function range(startOrEnd: number, end?: number, step = 1): number[] {
  let start: number;
  let stop: number;

  if (end === undefined) {
    start = 0;
    stop = startOrEnd;
  } else {
    start = startOrEnd;
    stop = end;
  }

  if (step === 0) {
    throw new RangeError('range() step cannot be 0');
  }

  const length = Math.max(0, Math.ceil((stop - start) / step));
  const result = new Array<number>(length);

  for (let i = 0; i < length; i++) {
    result[i] = start + i * step;
  }

  return result;
}

/**
 * Inclusive range – same as range but includes the end value
 * when it falls exactly on a step boundary.
 *
 * @example
 * rangeInclusive(1, 5)     // [1, 2, 3, 4, 5]
 * rangeInclusive(0, 10, 2) // [0, 2, 4, 6, 8, 10]
 */
export function rangeInclusive(
  start: number,
  end: number,
  step = 1
): number[] {
  if (step === 0) {
    throw new RangeError('rangeInclusive() step cannot be 0');
  }

  const direction = Math.sign(step);
  const length = Math.max(
    0,
    Math.floor((end - start) / step) + 1
  );

  // Guard against floating-point overshoot
  const result: number[] = [];
  for (let i = 0; i < length; i++) {
    const value = start + i * step;
    if (direction > 0 && value > end) break;
    if (direction < 0 && value < end) break;
    result.push(value);
  }

  return result;
}

/* ------------------------------------------------------------------ */
/* Usage examples                                                     */
/* ------------------------------------------------------------------ */
/*
console.log(range(5));              // [0, 1, 2, 3, 4]
console.log(range(2, 6));           // [2, 3, 4, 5]
console.log(range(0, 10, 2));       // [0, 2, 4, 6, 8]
console.log(range(5, 0, -1));       // [5, 4, 3, 2, 1]
console.log(rangeInclusive(1, 5));  // [1, 2, 3, 4, 5]
console.log(rangeInclusive(0, 1, 0.25)); // [0, 0.25, 0.5, 0.75, 1]

// Practical: generate page numbers
const totalPages = 10;
const pages = range(1, totalPages + 1); // [1, 2, …, 10]
*/
