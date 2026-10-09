/**
 * Parse and serialize URL query strings without a third-party library.
 *
 * Repeated keys become arrays. With `coerce` (default), the literals
 * "true", "false", and "null" and plain numbers are converted.
 *
 * @example
 * parseQuery("?page=2&active=true&tag=js&tag=ts");
 * // { page: 2, active: true, tag: ["js", "ts"] }
 *
 * stringifyQuery({ page: 2, tag: ["js", "ts"] });
 * // "?page=2&tag=js&tag=ts"
 */

export interface ParseOptions {
  /** Coerce "true", "false", "null", and numeric strings. Default true. */
  coerce?: boolean;
  /** Keys that should always be arrays, even with a single value. */
  arrayKeys?: readonly string[];
}

export type QueryValue = string | number | boolean | null | QueryValue[];
export type QueryRecord = Record<string, QueryValue>;

const NUMBER_RE = /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/;

/** Parse a query string or a full URL into a plain object. */
export function parseQuery(input: string, options: ParseOptions = {}): QueryRecord {
  const { coerce = true, arrayKeys = [] } = options;
  const query = extractQuery(input);
  const result: QueryRecord = {};
  if (!query) return result;

  const forced = new Set(arrayKeys);
  const params = new URLSearchParams(query);

  for (const key of new Set(params.keys())) {
    const values = params.getAll(key).map((value) => (coerce ? coerceValue(value) : value));
    result[key] = forced.has(key) || values.length > 1 ? values : values[0];
  }

  return result;
}

export interface StringifyOptions {
  /** Omit null and undefined. Default true. */
  skipNull?: boolean;
  /** Omit empty strings. Default false. */
  skipEmptyString?: boolean;
}

/** Serialize a record into a leading-`?` query string. Empty input returns "". */
export function stringifyQuery(
  record: Record<string, QueryValue | undefined>,
  options: StringifyOptions = {},
): string {
  const { skipNull = true, skipEmptyString = false } = options;
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(record)) {
    if (value === undefined) continue;
    const list = Array.isArray(value) ? value : [value];
    for (const item of list) {
      if (item === undefined) continue;
      if (skipNull && item === null) continue;
      if (skipEmptyString && item === "") continue;
      params.append(key, item === null ? "null" : String(item));
    }
  }

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/** Read the current location search, or an empty object outside the browser. */
export function readSearch(options?: ParseOptions): QueryRecord {
  if (typeof location === "undefined") return {};
  return parseQuery(location.search, options);
}

function extractQuery(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  const hash = trimmed.indexOf("#");
  const withoutHash = hash === -1 ? trimmed : trimmed.slice(0, hash);
  const q = withoutHash.indexOf("?");
  if (q !== -1) return withoutHash.slice(q + 1);
  if (withoutHash.includes("=")) return withoutHash.replace(/^\?/, "");
  return "";
}

function coerceValue(value: string): QueryValue {
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null") return null;
  if (value !== "" && NUMBER_RE.test(value)) return Number(value);
  return value;
}

const parsed = parseQuery("?page=2&active=true&tag=js&tag=ts");
const href = stringifyQuery({ page: 2, active: true, tag: ["js", "ts"], q: "frontend utils" });
console.log(parsed, href);
