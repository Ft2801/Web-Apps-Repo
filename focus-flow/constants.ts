import { TimerMode, ThemeColors } from './types';

export const TIMER_DURATIONS: Record<TimerMode, number> = {
  [TimerMode.FOCUS]: 25 * 60,
  [TimerMode.SHORT_BREAK]: 5 * 60,
  [TimerMode.LONG_BREAK]: 15 * 60,
  [TimerMode.CUSTOM]: 20 * 60, // Default custom duration
};

export const THEMES: Record<TimerMode, ThemeColors> = {
  [TimerMode.FOCUS]: {
    background: 'bg-rose-50',
    text: 'text-rose-900',
    subtext: 'text-rose-700/60',
    accent: 'bg-rose-500',
    ring: 'stroke-rose-400',
    ringBackground: 'stroke-rose-200',
    buttonText: 'text-rose-50',
  },
  [TimerMode.SHORT_BREAK]: {
    background: 'bg-teal-50',
    text: 'text-teal-900',
    subtext: 'text-teal-700/60',
    accent: 'bg-teal-500',
    ring: 'stroke-teal-400',
    ringBackground: 'stroke-teal-200',
    buttonText: 'text-teal-50',
  },
  [TimerMode.LONG_BREAK]: {
    background: 'bg-indigo-50',
    text: 'text-indigo-900',
    subtext: 'text-indigo-700/60',
    accent: 'bg-indigo-500',
    ring: 'stroke-indigo-400',
    ringBackground: 'stroke-indigo-200',
    buttonText: 'text-indigo-50',
  },
  [TimerMode.CUSTOM]: {
    background: 'bg-slate-50',
    text: 'text-slate-800',
    subtext: 'text-slate-600/60',
    accent: 'bg-slate-700',
    ring: 'stroke-slate-600',
    ringBackground: 'stroke-slate-200',
    buttonText: 'text-slate-50',
  },
};