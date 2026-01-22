import { ColorData, HarmonyMode, WCAGResult } from '../types';

// --- Conversions ---

export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

export const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
};

export const hslToRgb = (h: number, s: number, l: number): { r: number; g: number; b: number } => {
  let r, g, b;
  h /= 360;
  s /= 100;
  l /= 100;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
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
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
};

export const rgbToHex = (r: number, g: number, b: number): string => {
  return (
    '#' +
    ((1 << 24) + (r << 16) + (g << 8) + b)
      .toString(16)
      .slice(1)
      .toUpperCase()
  );
};

export const createColorData = (hex: string, isBase: boolean = false): ColorData => {
  const rgb = hexToRgb(hex);
  if (!rgb) return { hex: '#000000', rgb: 'rgb(0,0,0)', hsl: 'hsl(0, 0%, 0%)', isBase };
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  return {
    hex: hex.toUpperCase(),
    rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    hsl: `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`,
    isBase,
  };
};

// --- Accessibility ---

const getLuminance = (r: number, g: number, b: number) => {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

export const getContrastRatio = (hex1: string, hex2: string): WCAGResult => {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);

  if (!rgb1 || !rgb2) {
    return { ratio: 0, aa: false, aaa: false, aaLarge: false, aaaLarge: false };
  }

  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const ratio = l1 > l2 ? (l1 + 0.05) / (l2 + 0.05) : (l2 + 0.05) / (l1 + 0.05);
  const roundedRatio = Math.round(ratio * 100) / 100;

  return {
    ratio: roundedRatio,
    aa: roundedRatio >= 4.5,
    aaa: roundedRatio >= 7,
    aaLarge: roundedRatio >= 3,
    aaaLarge: roundedRatio >= 4.5,
  };
};

export const getBestContrastColor = (bgHex: string): string => {
  const whiteContrast = getContrastRatio(bgHex, '#FFFFFF').ratio;
  const blackContrast = getContrastRatio(bgHex, '#000000').ratio;
  return whiteContrast > blackContrast ? '#FFFFFF' : '#000000';
};

// --- Generators ---

const clampHue = (h: number) => (h < 0 ? h + 360 : h > 360 ? h - 360 : h);
const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

export const generatePalette = (baseHex: string, mode: HarmonyMode): ColorData[] => {
  const rgb = hexToRgb(baseHex);
  if (!rgb) return [];
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const colors: ColorData[] = [];

  // Helper to push color
  const addColor = (h: number, s: number, l: number, isBase: boolean = false) => {
    const finalRgb = hslToRgb(clampHue(h), clamp(s, 0, 100), clamp(l, 0, 100));
    colors.push(createColorData(rgbToHex(finalRgb.r, finalRgb.g, finalRgb.b), isBase));
  };

  switch (mode) {
    case 'analogous':
      addColor(hsl.h - 30, hsl.s, hsl.l);
      addColor(hsl.h - 15, hsl.s, hsl.l);
      addColor(hsl.h, hsl.s, hsl.l, true);
      addColor(hsl.h + 15, hsl.s, hsl.l);
      addColor(hsl.h + 30, hsl.s, hsl.l);
      break;
    case 'monochromatic':
      addColor(hsl.h, hsl.s, hsl.l - 30);
      addColor(hsl.h, hsl.s, hsl.l - 15);
      addColor(hsl.h, hsl.s, hsl.l, true);
      addColor(hsl.h, hsl.s, hsl.l + 15);
      addColor(hsl.h, hsl.s, hsl.l + 30);
      break;
    case 'complementary':
      // Base shades
      addColor(hsl.h, hsl.s, Math.max(10, hsl.l - 20));
      addColor(hsl.h, hsl.s, hsl.l, true);
      // Complementary
      const compH = hsl.h + 180;
      addColor(compH, hsl.s, hsl.l, false);
      addColor(compH, hsl.s, Math.min(90, hsl.l + 20));
      addColor(compH, Math.max(0, hsl.s - 20), hsl.l);
      break;
    case 'triadic':
      addColor(hsl.h, hsl.s, hsl.l, true);
      addColor(hsl.h + 120, hsl.s, hsl.l);
      addColor(hsl.h + 240, hsl.s, hsl.l);
      // Variations
      addColor(hsl.h + 120, hsl.s, Math.min(95, hsl.l + 20));
      addColor(hsl.h + 240, hsl.s, Math.max(5, hsl.l - 20));
      break;
    case 'split-complementary':
      addColor(hsl.h, hsl.s, hsl.l, true);
      addColor(hsl.h + 150, hsl.s, hsl.l);
      addColor(hsl.h + 210, hsl.s, hsl.l);
      // Variation
      addColor(hsl.h, Math.max(0, hsl.s - 30), Math.min(95, hsl.l + 30));
      addColor(hsl.h + 150, hsl.s, Math.max(5, hsl.l - 20));
      break;
    default:
        // Default to monochromatic fallback
      addColor(hsl.h, hsl.s, hsl.l, true);
      break;
  }

  return colors;
};