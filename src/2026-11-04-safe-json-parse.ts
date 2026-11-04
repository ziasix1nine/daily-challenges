/**
 * Safely parses a JSON string and returns a default value if parsing fails.
 * Useful for handling potentially invalid JSON from localStorage, APIs, or user input.
 *
 * @template T
 * @param {string | null | undefined} jsonString - The string to parse
 * @param {T} defaultValue - Value to return if parsing fails or input is invalid
 * @returns {T} The parsed value or the default
 *
 * @example
 * const user = safeJsonParse(localStorage.getItem('user'), { name: 'Guest' });
 * const settings = safeJsonParse(apiResponse, {});
 */
export function safeJsonParse<T>(
  jsonString: string | null | undefined,
  defaultValue: T
): T {
  if (jsonString == null || jsonString === '') {
    return defaultValue;
  }

  try {
    return JSON.parse(jsonString) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * Safely stringifies a value to JSON, returning a fallback string on failure.
 *
 * @param value - Value to stringify
 * @param fallback - String to return if stringification fails (default: '{}')
 * @returns JSON string or fallback
 */
export function safeJsonStringify(
  value: unknown,
  fallback: string = '{}'
): string {
  try {
    return JSON.stringify(value);
  } catch {
    return fallback;
  }
}

// Usage example
if (typeof window !== 'undefined') {
  const raw = localStorage.getItem('config');
  const config = safeJsonParse(raw, { theme: 'light', notifications: true });
  console.log('Loaded config:', config);

  const saved = safeJsonStringify(config);
  console.log('Stringified:', saved);
}
