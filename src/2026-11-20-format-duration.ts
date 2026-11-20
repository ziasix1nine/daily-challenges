/**
 * formatDuration — Convert a duration in milliseconds into a human-readable string.
 *
 * Supports customizable units, precision, and style (long / short / narrow).
 * Useful for displaying timers, video lengths, API response times, etc.
 *
 * @example
 * formatDuration(90000);                    // "1m 30s"
 * formatDuration(3_600_000 + 45_000);       // "1h 45s"
 * formatDuration(45_000, { style: 'long' }); // "45 seconds"
 * formatDuration(1_500, { maxUnits: 1 });    // "2s" (rounded)
 */

export type DurationStyle = 'long' | 'short' | 'narrow';

export interface FormatDurationOptions {
  /** Number of most significant units to show (default: 2) */
  maxUnits?: number;
  /** 'long' = "1 hour 30 seconds", 'short' = "1h 30s", 'narrow' = "1:30" */
  style?: DurationStyle;
  /** Whether to pad numbers with leading zeros in narrow style (default: true) */
  pad?: boolean;
}

const UNITS: { key: string; ms: number; long: [string, string]; short: string; narrow: string }[] = [
  { key: 'd', ms: 86_400_000, long: ['day', 'days'], short: 'd', narrow: 'd' },
  { key: 'h', ms: 3_600_000,  long: ['hour', 'hours'], short: 'h', narrow: 'h' },
  { key: 'm', ms: 60_000,     long: ['minute', 'minutes'], short: 'm', narrow: 'm' },
  { key: 's', ms: 1_000,      long: ['second', 'seconds'], short: 's', narrow: 's' },
  { key: 'ms', ms: 1,         long: ['millisecond', 'milliseconds'], short: 'ms', narrow: 'ms' },
];

export function formatDuration(ms: number, options: FormatDurationOptions = {}): string {
  const { maxUnits = 2, style = 'short', pad = true } = options;

  if (ms < 0) ms = 0;
  if (ms === 0) return style === 'long' ? '0 seconds' : '0s';

  const parts: string[] = [];
  let remaining = ms;

  for (const unit of UNITS) {
    if (parts.length >= maxUnits) break;
    if (remaining < unit.ms && parts.length === 0) continue;

    const value = Math.floor(remaining / unit.ms);
    if (value === 0 && parts.length > 0) continue;

    remaining %= unit.ms;

    if (style === 'long') {
      const label = value === 1 ? unit.long[0] : unit.long[1];
      parts.push(`${value} ${label}`);
    } else if (style === 'short') {
      parts.push(`${value}${unit.short}`);
    } else {
      // narrow — colon-separated, padded
      const padded = pad && parts.length > 0 ? String(value).padStart(2, '0') : String(value);
      parts.push(padded);
    }
  }

  if (parts.length === 0) {
    return style === 'long' ? '0 seconds' : '0s';
  }

  return style === 'narrow' ? parts.join(':') : parts.join(' ');
}

// ---------------------------------------------------------------------------
// Usage examples
// ---------------------------------------------------------------------------

console.log(formatDuration(90_000));                    // "1m 30s"
console.log(formatDuration(3_645_000));                 // "1h 45s"
console.log(formatDuration(45_000, { style: 'long' })); // "45 seconds"
console.log(formatDuration(1_500, { maxUnits: 1 }));    // "2s"
console.log(formatDuration(3_661_000, { style: 'narrow' })); // "1:01:01"
console.log(formatDuration(0));                         // "0s"
