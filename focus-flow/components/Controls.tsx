import React from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { TimerMode, ThemeColors } from '../types';

interface ControlsProps {
  isActive: boolean;
  onToggle: () => void;
  onReset: () => void;
  currentMode: TimerMode;
  onModeChange: (mode: TimerMode) => void;
  theme: ThemeColors;
}

const Controls: React.FC<ControlsProps> = ({ 
  isActive, 
  onToggle, 
  onReset, 
  currentMode, 
  onModeChange,
  theme 
}) => {
  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-md">
      {/* Mode Selector - Increased size for mobile readability */}
      <div className="flex flex-wrap justify-center gap-2 p-2 rounded-[2rem] bg-white/40 backdrop-blur-sm shadow-sm border border-white/50 max-w-full">
        {[TimerMode.FOCUS, TimerMode.SHORT_BREAK, TimerMode.LONG_BREAK, TimerMode.CUSTOM].map((mode) => {
          const isActiveMode = currentMode === mode;
          let label = "Focus";
          if (mode === TimerMode.SHORT_BREAK) label = "Short";
          if (mode === TimerMode.LONG_BREAK) label = "Long";
          if (mode === TimerMode.CUSTOM) label = "Custom";

          return (
            <button
              key={mode}
              onClick={() => onModeChange(mode)}
              className={`
                px-5 py-3 rounded-full text-sm font-medium transition-all duration-300
                ${isActiveMode ? 'bg-white shadow-sm scale-105' : 'hover:bg-white/50'}
                ${isActiveMode ? theme.text : theme.subtext}
              `}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Main Controls */}
      {/* Grid layout ensures Play button remains perfectly centered while Reset sits to the left */}
      <div className="grid grid-cols-3 items-center w-full max-w-sm">
        
        {/* Left: Reset Button */}
        <div className="flex justify-end pr-6">
          <button
            onClick={onReset}
            className={`p-3 rounded-full transition-all duration-300 hover:bg-white/20 active:scale-95 opacity-70 hover:opacity-100 ${theme.text}`}
            aria-label="Reset Timer"
            title="Reset Timer"
          >
            <RotateCcw size={22} strokeWidth={1.5} />
          </button>
        </div>

        {/* Center: Play/Pause Button */}
        <div className="flex justify-center">
          <button
            onClick={onToggle}
            className={`
              p-6 rounded-full shadow-lg transition-all duration-300 
              hover:shadow-xl hover:scale-105 active:scale-95
              ${theme.accent} ${theme.buttonText}
            `}
            aria-label={isActive ? "Pause Timer" : "Start Timer"}
          >
            {isActive ? (
              <Pause size={32} fill="currentColor" strokeWidth={0} />
            ) : (
              <Play size={32} fill="currentColor" strokeWidth={0} className="ml-1" />
            )}
          </button>
        </div>

        {/* Right: Empty spacer for balance */}
        <div className="flex justify-start pl-6 pointer-events-none opacity-0">
           <div className="w-[46px] h-[46px]" /> {/* Match Reset button approximate visual weight */}
        </div>
      </div>
    </div>
  );
};

export default Controls;