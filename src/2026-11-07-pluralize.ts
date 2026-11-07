/**
 * Pluralize a word based on a count.
 *
 * Supports simple English pluralization rules (add 's', 'es', irregulars can be passed).
 *
 * @example
 * pluralize(1, 'item');
 * // => '1 item'
 *
 * pluralize(5, 'item');
 * // => '5 items'
 *
 * pluralize(0, 'child', 'children');
 * // => '0 children'
 */
export function pluralize(
  count: number,
  singular: string,
  plural?: string
): string {
  const word = count === 1 ? singular : (plural ?? pluralizeWord(singular));
  return `${count} ${word}`;
}

/**
 * Basic pluralization of a single word.
 * Handles common cases: y -> ies, s/sh/ch/x/z -> es, else + s.
 */
function pluralizeWord(word: string): string {
  if (word.endsWith('y') && !/[aeiou]y$/i.test(word)) {
    return word.slice(0, -1) + 'ies';
  }
  if (/(s|sh|ch|x|z)$/i.test(word)) {
    return word + 'es';
  }
  return word + 's';
}

// Usage example:
if (typeof window === 'undefined' && typeof process !== 'undefined') {
  console.log(pluralize(1, 'apple'));
  console.log(pluralize(3, 'apple'));
  console.log(pluralize(2, 'box'));
  console.log(pluralize(1, 'person', 'people'));
  console.log(pluralize(0, 'person', 'people'));
}
