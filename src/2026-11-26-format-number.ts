/**
 * Flexible number formatting utility for frontend display.
 *
 * Handles thousands separators, decimal places, currency-style,
 * percentages, compact notation, and custom locales.
 *
 * Pure function — no dependencies, works in any JS/TS environment.
 *
 * @example
 * ```ts
 * formatNumber(1234567.89);                    // "1,234,567.89"
 * formatNumber(1234567.89, { decimals: 0 });   // "1,234,568"
 * formatNumber(0.156, { style: 'percent' });   // "15.6%"
 * formatNumber(1500, { notation: 'compact' }); // "1.5K"
 * formatNumber(42.5, { prefix: '$', decimals: 2 }); // "$42.50"
 * ```
 */

export interface FormatNumberOptions {
  /** Number of decimal places (default: auto / full precision up to 2) */
  decimals?: number;
  /** Locale for formatting (default: 'en-US') */
  locale?: string;
  /** Style: 'decimal' | 'percent' | 'currency' */
  style?: 'decimal' | 'percent' | 'currency';
  /** Currency code when style is 'currency' (e.g. 'USD', 'EUR') */
  currency?: string;
  /** Compact notation: 'standard' | 'compact' */
  notation?: 'standard' | 'compact';
  /** Prefix to prepend (e.g. '$', '€') */
  prefix?: string;
  /** Suffix to append (e.g. 'px', 'ms') */
  suffix?: string;
  /** Whether to use grouping separators (default: true) */
  useGrouping?: boolean;
}

const DEFAULT_OPTIONS: Required<
  Pick<FormatNumberOptions, 'locale' | 'style' | 'notation' | 'useGrouping'>
> = {
  locale: 'en-US',
  style: 'decimal',
  notation: 'standard',
  useGrouping: true,
};

/**
 * Formats a number according to the provided options.
 *
 * @param value - The number to format
 * @param options - Formatting options
 * @returns Formatted string
 */
export function formatNumber(
  value: number,
  options: FormatNumberOptions = {}
): string {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return String(value);
  }

  const {
    decimals,
    locale = DEFAULT_OPTIONS.locale,
    style = DEFAULT_OPTIONS.style,
    currency,
    notation = DEFAULT_OPTIONS.notation,
    prefix = '',
    suffix = '',
    useGrouping = DEFAULT_OPTIONS.useGrouping,
  } = options;

  // For percent style, the value is treated as a fraction (0.15 → 15%)
  const adjustedValue = style === 'percent' ? value : value;

  const intlOptions: Intl.NumberFormatOptions = {
    style: style === 'currency' ? 'currency' : style === 'percent' ? 'percent' : 'decimal',
    notation,
    useGrouping,
  };

  if (currency && style === 'currency') {
    intlOptions.currency = currency;
  }

  if (typeof decimals === 'number') {
    intlOptions.minimumFractionDigits = decimals;
    intlOptions.maximumFractionDigits = decimals;
  } else if (style === 'percent') {
    // Sensible default for percentages
    intlOptions.minimumFractionDigits = 0;
    intlOptions.maximumFractionDigits = 1;
  }

  const formatted = new Intl.NumberFormat(locale, intlOptions).format(adjustedValue);

  return `${prefix}${formatted}${suffix}`;
}

/**
 * Convenience helper for currency formatting.
 */
export function formatCurrency(
  value: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return formatNumber(value, {
    style: 'currency',
    currency,
    locale,
    decimals: 2,
  });
}

/**
 * Convenience helper for percentage formatting.
 * Expects a fraction (0.25 → "25%").
 */
export function formatPercent(
  value: number,
  decimals: number = 0,
  locale: string = 'en-US'
): string {
  return formatNumber(value, {
    style: 'percent',
    decimals,
    locale,
  });
}

// ——— Usage examples ———
/*
console.log(formatNumber(1234567.891));                  // "1,234,567.891"
console.log(formatNumber(1234567.891, { decimals: 2 })); // "1,234,567.89"
console.log(formatNumber(0.156, { style: 'percent' }));  // "15.6%"
console.log(formatNumber(1500000, { notation: 'compact' })); // "1.5M"
console.log(formatCurrency(42.5));                       // "$42.50"
console.log(formatPercent(0.875, 1));                    // "87.5%"
console.log(formatNumber(100, { prefix: '~', suffix: ' items' })); // "~100 items"
*/
