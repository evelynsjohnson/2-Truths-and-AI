// Utility functions for the game

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
export function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Format a score with commas
 */
export function formatScore(score) {
  return score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Calculate points based on difficulty and speed
 */
//TODO: Refine point calculation logic
export function calculatePoints(isCorrect, timeSpent, difficulty = 'normal') {
  if (!isCorrect) return 0;
  
  const basePoints = {
    easy: 5,
    normal: 10,
    hard: 15
  }[difficulty] || 10;
  
  // Bonus for quick answers (within 10 seconds)
  const speedBonus = timeSpent < 10000 ? 5 : 0;
  
  return basePoints + speedBonus;
}

/**
 * Generate a unique ID
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const bigint = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}

function rgbToHex(r, g, b) {
  const toHex = (n) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }
    h /= 6;
  }
  return { h: h * 360, s, l };
}

function hslToRgb(h, s, l) {
  h /= 360;
  let r, g, b;
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

/**
 * Darken a hex color by reducing lightness. Optionally adjust saturation.
 * - hex: input hex string
 * - percent: number (0-100) to reduce lightness by that many percentage points
 * - options: { saturationMultiplier } - multiply the original saturation by this value (defaults to 1)
 * Returns a hex string.
 */
export function darkenHex(hex, percent, options = {}) {
  const { saturationMultiplier = 1 } = options;
  const { r, g, b } = hexToRgb(hex);
  const hsl = rgbToHsl(r, g, b);
  hsl.s = clamp01(hsl.s * saturationMultiplier);
  hsl.l = Math.max(0, hsl.l - (percent / 100));
  const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

/**
 * Lighten a hex color by increasing lightness. Optionally nudge saturation.
 * - percent: number (0-100) to increase lightness
 * - options: { saturationOffset } - add this to saturation (can be negative)
 */
export function lightenHex(hex, percent, options = {}) {
  const { saturationOffset = 0 } = options;
  const { r, g, b } = hexToRgb(hex);
  const hsl = rgbToHsl(r, g, b);
  hsl.s = clamp01(hsl.s + saturationOffset);
  hsl.l = Math.min(1, hsl.l + (percent / 100));
  const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

/**
 * Derive a secondary and secondary-hover color from a primary hex using
 * the project's preferred coefficients so the visual relationship is
 * consistent across themes.
 * Coefficients chosen to match existing palette:
 *  - secondary.s = primary.s * 0.63
 *  - secondary.l = primary.l - 0.18
 *  - hover.s = secondary.s + 0.12
 *  - hover.l = secondary.l + 0.08
 */
export function deriveSecondaryFromPrimary(hexPrimary) {
  const { r, g, b } = hexToRgb(hexPrimary);
  const { h, s, l } = rgbToHsl(r, g, b);

  const sec = {
    h,
    s: clamp01(s * 0.63),
    l: clamp01(l - 0.18)
  };

  const hov = {
    h,
    s: clamp01(sec.s + 0.12),
    l: clamp01(sec.l + 0.08)
  };

  const secRgb = hslToRgb(sec.h, sec.s, sec.l);
  const hovRgb = hslToRgb(hov.h, hov.s, hov.l);

  return {
    secondary: rgbToHex(secRgb.r, secRgb.g, secRgb.b),
    secondaryHover: rgbToHex(hovRgb.r, hovRgb.g, hovRgb.b)
  };
}
