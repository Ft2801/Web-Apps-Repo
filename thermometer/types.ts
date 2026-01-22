export type Unit = 'C' | 'F';

export interface WeatherState {
  label: string;
  color: string; // Tailwind text color class
  bgGradient: string; // CSS background gradient
  liquidColor: string; // Hex color for SVG fill
  icon: string;
}
