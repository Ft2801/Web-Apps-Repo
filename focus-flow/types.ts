export enum TimerMode {
  FOCUS = 'FOCUS',
  SHORT_BREAK = 'SHORT_BREAK',
  LONG_BREAK = 'LONG_BREAK',
  CUSTOM = 'CUSTOM'
}

export interface Session {
  id: string;
  mode: TimerMode;
  completedAt: string; // ISO date string
  durationMinutes: number;
}

export interface ThemeColors {
  background: string;
  text: string;
  subtext: string;
  accent: string;
  ring: string;
  ringBackground: string;
  buttonText: string;
}