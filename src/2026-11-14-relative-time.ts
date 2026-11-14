/**
 * Formats a date or timestamp into a human-readable relative time string.
 *
 * Examples:
 * - "just now"
 * - "2 minutes ago"
 * - "in 3 hours"
 * - "yesterday"
 * - "last week"
 *
 * @param date - Date object, timestamp (ms), or ISO string
 * @param options - Optional configuration
 * @returns Relative time string
 *
 * @example
 * relativeTime(new Date(Date.now() - 120_000)); // "2 minutes ago"
 * relativeTime(Date.now() + 3_600_000); // "in 1 hour"
 */
export function relativeTime(
  date: Date | number | string,
  options: {
    now?: Date | number;
    locale?: string;
    numeric?: "always" | "auto";
  } = {}
): string {
  const target = new Date(date);
  const now = options.now ? new Date(options.now) : new Date();

  if (Number.isNaN(target.getTime())) {
    return "Invalid date";
  }

  const diffMs = target.getTime() - now.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const absSec = Math.abs(diffSec);

  const rtf = new Intl.RelativeTimeFormat(options.locale ?? "en", {
    numeric: options.numeric ?? "auto",
  });

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["week", 60 * 60 * 24 * 7],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
    ["second", 1],
  ];

  for (const [unit, secondsInUnit] of units) {
    if (absSec >= secondsInUnit || unit === "second") {
      const value = Math.round(diffSec / secondsInUnit);
      return rtf.format(value, unit);
    }
  }

  return rtf.format(0, "second");
}

// Usage example
if (typeof process !== "undefined" && process.env.NODE_ENV !== "production") {
  console.log(relativeTime(Date.now() - 5_000)); // "5 seconds ago"
  console.log(relativeTime(Date.now() - 90_000)); // "2 minutes ago"
  console.log(relativeTime(Date.now() + 86_400_000)); // "tomorrow"
}
