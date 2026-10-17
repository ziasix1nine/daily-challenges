/**
 * Fisher-Yates (Knuth) shuffle – an unbiased, in-place (or immutable) array shuffler.
 *
 * Provides both a mutating and a non-mutating version.
 * Perfect for randomizing playlists, quiz questions, card decks, etc.
 *
 * Time complexity: O(n)
 * Space complexity: O(1) for in-place, O(n) for the immutable version
 *
 * @example
 * const deck = ['A', '2', '3', '4', '5'];
 * const shuffled = shuffle(deck);          // new array
 * shuffleInPlace(deck);                    // mutates original
 */

/**
 * Returns a new array with the elements randomly shuffled (Fisher-Yates).
 * The original array is left unchanged.
 *
 * @param array - The source array
 * @returns A new shuffled array
 */
export function shuffle<T>(array: readonly T[]): T[] {
  const result = array.slice();
  shuffleInPlace(result);
  return result;
}

/**
 * Shuffles an array in place using the Fisher-Yates algorithm.
 * Mutates the original array and returns it for convenience.
 *
 * @param array - The array to shuffle (mutated)
 * @returns The same array reference, now shuffled
 */
export function shuffleInPlace<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // Swap elements
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Creates a seeded shuffle using a simple linear congruential generator.
 * Useful for reproducible randomness (tests, demos, games with seeds).
 *
 * @param array - Source array
 * @param seed  - Numeric seed
 * @returns A new shuffled array
 */
export function shuffleSeeded<T>(array: readonly T[], seed: number): T[] {
  const result = array.slice();
  let s = seed >>> 0; // ensure unsigned 32-bit

  // Simple LCG parameters (Numerical Recipes)
  const next = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

// ---------------------------------------------------------------------------
// Usage examples
// ---------------------------------------------------------------------------
const cards = ['A♠', 'K♠', 'Q♠', 'J♠', '10♠'];

console.log('Original:', cards);
console.log('Shuffled (immutable):', shuffle(cards));
console.log('Original still intact:', cards);

const mutable = [...cards];
shuffleInPlace(mutable);
console.log('Shuffled in place:', mutable);

console.log('Seeded shuffle (seed=42):', shuffleSeeded(cards, 42));
console.log('Same seed again:      ', shuffleSeeded(cards, 42));
