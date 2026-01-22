import { WeatherState } from '../types';

export const celsiusToFahrenheit = (c: number): number => Math.round((c * 9) / 5 + 32);

export const fahrenheitToCelsius = (f: number): number => Math.round(((f - 32) * 5) / 9);

export const getPercentage = (temp: number, min: number, max: number): number => {
  return Math.min(100, Math.max(0, ((temp - min) / (max - min)) * 100));
};

// --- Color Interpolation Logic ---

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

const rgbToHex = (r: number, g: number, b: number) => 
  "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

const interpolateColor = (c1: string, c2: string, factor: number): string => {
  const rgb1 = hexToRgb(c1);
  const rgb2 = hexToRgb(c2);
  const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * factor);
  const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * factor);
  const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * factor);
  return rgbToHex(r, g, b);
}

// Definition of color stops for smooth transitions
// t: temp, c: liquid/slider color, bgTop/bgBot: background gradient colors
const COLOR_STOPS = [
    { t: -50, c: '#22d3ee', bgTop: '#020617', bgBot: '#1e3a8a' }, // Deep Ice (Cyan/Dark Blue)
    { t: -20, c: '#38bdf8', bgTop: '#082f49', bgBot: '#0369a1' }, // Freezing (Light Blue)
    { t: 0,   c: '#60a5fa', bgTop: '#172554', bgBot: '#2563eb' }, // Cold (Blue)
    { t: 15,  c: '#34d399', bgTop: '#064e3b', bgBot: '#059669' }, // Cool (Emerald)
    { t: 25,  c: '#a3e635', bgTop: '#365314', bgBot: '#65a30d' }, // Pleasant (Lime)
    { t: 30,  c: '#facc15', bgTop: '#713f12', bgBot: '#ca8a04' }, // Warm (Yellow)
    { t: 40,  c: '#fb923c', bgTop: '#7c2d12', bgBot: '#ea580c' }, // Hot (Orange)
    { t: 70,  c: '#ef4444', bgTop: '#7f1d1d', bgBot: '#dc2626' }, // Scorching (Red)
    { t: 100, c: '#b91c1c', bgTop: '#450a0a', bgBot: '#991b1b' }, // Burning (Dark Red)
];

export const getTempStyle = (temp: number) => {
    // Find the two stops surrounding the current temperature
    let start = COLOR_STOPS[0];
    let end = COLOR_STOPS[COLOR_STOPS.length - 1];
    
    // Clamp temp for style calculation if outside range (though slider limits prevent this mostly)
    const clampedTemp = Math.max(-50, Math.min(100, temp));

    for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
        if (clampedTemp >= COLOR_STOPS[i].t && clampedTemp <= COLOR_STOPS[i+1].t) {
            start = COLOR_STOPS[i];
            end = COLOR_STOPS[i+1];
            break;
        }
    }

    // Calculate interpolation factor (0 to 1)
    const range = end.t - start.t;
    const factor = range === 0 ? 0 : (clampedTemp - start.t) / range;
    
    // Interpolate values
    const liquidColor = interpolateColor(start.c, end.c, factor);
    const bgTop = interpolateColor(start.bgTop, end.bgTop, factor);
    const bgBot = interpolateColor(start.bgBot, end.bgBot, factor);

    return {
        liquidColor,
        bgGradient: `linear-gradient(to bottom, ${bgTop}, ${bgBot})`,
    };
};

// Legacy support for labels and icons (discrete thresholds are fine for text)
export const getWeatherState = (temp: number): WeatherState => {
  // Styles are ignored here as they are now dynamic, but we keep the structure for icons/labels
  if (temp <= -20) return { label: 'Freezing', color: '', bgGradient: '', liquidColor: '', icon: 'snowflake-heavy' };
  if (temp <= 0) return { label: 'Very Cold', color: '', bgGradient: '', liquidColor: '', icon: 'snowflake' };
  if (temp <= 15) return { label: 'Cool', color: '', bgGradient: '', liquidColor: '', icon: 'cloud-rain' };
  if (temp <= 28) return { label: 'Pleasant', color: '', bgGradient: '', liquidColor: '', icon: 'sun' };
  if (temp <= 40) return { label: 'Hot', color: '', bgGradient: '', liquidColor: '', icon: 'sun-medium' };
  return { label: 'Scorching', color: '', bgGradient: '', liquidColor: '', icon: 'flame' };
};