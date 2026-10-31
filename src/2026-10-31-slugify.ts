/**
 * Converts a string into a URL-friendly slug.
 *
 * Handles diacritics, special characters, multiple spaces, and custom separators.
 *
 * @example
 * slugify('Hello World!') // 'hello-world'
 * slugify('Café & Restaurant', { separator: '_' }) // 'cafe_restaurant'
 * slugify('  Multiple   Spaces  ') // 'multiple-spaces'
 */
export function slugify(
  input: string,
  options: {
    separator?: string;
    lowercase?: boolean;
    maxLength?: number;
  } = {}
): string {
  const {
    separator = '-',
    lowercase = true,
    maxLength,
  } = options;

  if (typeof input !== 'string') {
    return '';
  }

  let result = input
    // Normalize unicode (NFD) to separate diacritics
    .normalize('NFD')
    // Remove diacritical marks
    .replace(/[\u0300-\u036f]/g, '')
    // Replace non-alphanumeric characters (except spaces and hyphens) with space
    .replace(/[^a-zA-Z0-9\s-]/g, ' ')
    // Collapse multiple spaces/hyphens into single space
    .replace(/[\s-]+/g, ' ')
    .trim();

  if (lowercase) {
    result = result.toLowerCase();
  }

  // Replace spaces with separator
  result = result.replace(/\s+/g, separator);

  // Remove leading/trailing separators
  const sepEscaped = separator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  result = result.replace(new RegExp(`^${sepEscaped}+|${sepEscaped}+$`, 'g'), '');

  if (maxLength && result.length > maxLength) {
    result = result.slice(0, maxLength);
    // Avoid cutting in the middle of a separator if possible
    const lastSep = result.lastIndexOf(separator);
    if (lastSep > maxLength * 0.7) {
      result = result.slice(0, lastSep);
    }
  }

  return result;
}

// Usage example
if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
  console.log(slugify('Hello World!')); // hello-world
  console.log(slugify('Café & Bistro 2024')); // cafe-bistro-2024
  console.log(slugify('  Trim   Me  ', { separator: '_' })); // trim_me
}
