/**
 * Color contrast utilities for accessibility (WCAG 2.1).
 * Helps determine if text/background combinations meet AA/AAA contrast requirements.
 */

export interface RGB {
  r: number;
  g: number;
  b: number;
}

/**
 * Parse a hex color string into RGB components.
 * Supports #RGB, #RRGGBB, and #RRGGBBAA (alpha ignored).
 */
export function hexToRgb(hex: string): RGB | null {
  const cleaned = hex.replace(/^#/, "").trim();
  let r: number, g: number, b: number;

  if (cleaned.length === 3) {
    r = parseInt(cleaned[0] + cleaned[0], 16);
    g = parseInt(cleaned[1] + cleaned[1], 16);
    b = parseInt(cleaned[2] + cleaned[2], 16);
  } else if (cleaned.length === 6 || cleaned.length === 8) {
    r = parseInt(cleaned.slice(0, 2), 16);
    g = parseInt(cleaned.slice(2, 4), 16);
    b = parseInt(cleaned.slice(4, 6), 16);
  } else {
    return null;
  }

  if ([r, g, b].some((v) => Number.isNaN(v))) return null;
  return { r, g, b };
}

/**
 * Calculate the relative luminance of an RGB color (per WCAG).
 * Values are 0–1.
 */
export function relativeLuminance({ r, g, b }: RGB): number {
  const toLinear = (c: number): number => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };

  const R = toLinear(r);
  const G = toLinear(g);
  const B = toLinear(b);

  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/**
 * Calculate the contrast ratio between two colors (1–21).
 * Higher is better. WCAG AA requires 4.5:1 for normal text, 3:1 for large text.
 */
export function contrastRatio(color1: string | RGB, color2: string | RGB): number | null {
  const rgb1 = typeof color1 === "string" ? hexToRgb(color1) : color1;
  const rgb2 = typeof color2 === "string" ? hexToRgb(color2) : color2;

  if (!rgb1 || !rgb2) return null;

  const l1 = relativeLuminance(rgb1);
  const l2 = relativeLuminance(rgb2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if a color pair meets WCAG AA contrast requirements.
 */
export function meetsAA(
  foreground: string | RGB,
  background: string | RGB,
  largeText = false
): boolean {
  const ratio = contrastRatio(foreground, background);
  if (ratio === null) return false;
  return largeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Check if a color pair meets WCAG AAA contrast requirements.
 */
export function meetsAAA(
  foreground: string | RGB,
  background: string | RGB,
  largeText = false
): boolean {
  const ratio = contrastRatio(foreground, background);
  if (ratio === null) return false;
  return largeText ? ratio >= 4.5 : ratio >= 7;
}

// --- Usage example ---

if (import.meta.env?.DEV || typeof process !== "undefined") {
  const ratio = contrastRatio("#ffffff", "#000000");
  console.log("White on black contrast:", ratio?.toFixed(2)); // ~21.00

  console.log("AA normal text:", meetsAA("#767676", "#ffffff")); // true (~4.54)
  console.log("AAA normal text:", meetsAAA("#767676", "#ffffff")); // false
  console.log("AA large text:", meetsAA("#777777", "#ffffff", true)); // true
}
