/**
 * Color conversion utilities for hex ↔ RGB ↔ HSL.
 * Useful for theming, dynamic CSS, contrast calculations, and design systems.
 */

export interface RGB {
  r: number; // 0–255
  g: number; // 0–255
  b: number; // 0–255
}

export interface HSL {
  h: number; // 0–360
  s: number; // 0–100
  l: number; // 0–100
}

/**
 * Parse a hex color string into RGB.
 * Supports #RGB, #RRGGBB, #RGBA, #RRGGBBAA (alpha is ignored).
 */
export function hexToRgb(hex: string): RGB | null {
  const cleaned = hex.trim().replace(/^#/, "");
  let full = cleaned;

  if (cleaned.length === 3 || cleaned.length === 4) {
    full = cleaned
      .split("")
      .map((c) => c + c)
      .join("");
  }

  if (full.length !== 6 && full.length !== 8) return null;

  const num = parseInt(full.slice(0, 6), 16);
  if (Number.isNaN(num)) return null;

  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Convert RGB to hex string (#RRGGBB).
 */
export function rgbToHex({ r, g, b }: RGB): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  const toHex = (n: number) => clamp(n).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Convert RGB to HSL.
 */
export function rgbToHsl({ r, g, b }: RGB): HSL {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert HSL to RGB.
 */
export function hslToRgb({ h, s, l }: HSL): RGB {
  h = ((h % 360) + 360) % 360;
  s /= 100;
  l /= 100;

  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v };
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hNorm = h / 360;

  return {
    r: Math.round(hue2rgb(p, q, hNorm + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, hNorm) * 255),
    b: Math.round(hue2rgb(p, q, hNorm - 1 / 3) * 255),
  };
}

/**
 * Convenience: hex → HSL
 */
export function hexToHsl(hex: string): HSL | null {
  const rgb = hexToRgb(hex);
  return rgb ? rgbToHsl(rgb) : null;
}

/**
 * Convenience: HSL → hex
 */
export function hslToHex(hsl: HSL): string {
  return rgbToHex(hslToRgb(hsl));
}

// ——— Usage examples ———
/*
console.log(hexToRgb("#1a2b3c"));           // { r: 26, g: 43, b: 60 }
console.log(hexToRgb("#abc"));              // { r: 170, g: 187, b: 204 }
console.log(rgbToHex({ r: 26, g: 43, b: 60 })); // "#1A2B3C"
console.log(rgbToHsl({ r: 26, g: 43, b: 60 })); // { h: 210, s: 40, l: 17 }
console.log(hslToHex({ h: 210, s: 40, l: 17 })); // "#1A2B3C"
*/
