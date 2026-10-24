/**
 * formatBytes
 *
 * Converts a byte count into a human-readable string (e.g. "1.5 KB", "2.3 MB").
 * Useful for file sizes, progress indicators, and storage displays.
 *
 * @param bytes - The number of bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string with appropriate unit
 *
 * @example
 * formatBytes(1024);          // "1 KB"
 * formatBytes(1536, 1);       // "1.5 KB"
 * formatBytes(1048576);       // "1 MB"
 * formatBytes(0);             // "0 Bytes"
 */

const UNITS = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'] as const;

export function formatBytes(bytes: number, decimals = 2): string {
  if (!Number.isFinite(bytes) || bytes < 0) {
    throw new Error('bytes must be a non-negative finite number');
  }

  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = Math.max(0, decimals);
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(k)),
    UNITS.length - 1
  );

  const value = bytes / Math.pow(k, i);
  const formatted = value.toFixed(dm).replace(/\.?0+$/, '');

  return `${formatted} ${UNITS[i]}`;
}

// Usage examples:
// console.log(formatBytes(0));           // "0 Bytes"
// console.log(formatBytes(1024));        // "1 KB"
// console.log(formatBytes(1536, 1));     // "1.5 KB"
// console.log(formatBytes(1048576));     // "1 MB"
// console.log(formatBytes(123456789));   // "117.74 MB"
