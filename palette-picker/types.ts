export interface ColorData {
  hex: string;
  rgb: string;
  hsl: string;
  isBase?: boolean;
}

export type HarmonyMode = 'analogous' | 'complementary' | 'monochromatic' | 'triadic' | 'split-complementary';

export interface PaletteHistoryItem {
  id: string;
  timestamp: number;
  baseColor: string;
  mode: HarmonyMode;
  colors: ColorData[];
}

export interface WCAGResult {
  ratio: number;
  aa: boolean;
  aaa: boolean;
  aaLarge: boolean;
  aaaLarge: boolean;
}