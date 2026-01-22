import React from 'react';
import { ThemeColors } from '../types';

interface CircularTimerProps {
  timeLeft: number;
  totalTime: number;
  isActive: boolean;
  theme: ThemeColors;
}

const CircularTimer: React.FC<CircularTimerProps> = ({ timeLeft, totalTime, isActive, theme }) => {
  // SVG Configuration
  const radius = 120;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  
  const strokeDashoffset = circumference - (timeLeft / totalTime) * circumference;

  // Format time MM:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="relative flex items-center justify-center">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90 transition-all duration-500"
      >
        {/* Background Ring */}
        <circle
          className={`transition-colors duration-500 ease-in-out ${theme.ringBackground}`}
          strokeWidth={stroke}
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Progress Ring */}
        <circle
          className={`transition-all duration-500 ease-in-out ${theme.ring}`}
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      
      {/* Time Display */}
      <div className="absolute flex flex-col items-center justify-center">
        <span className={`text-6xl font-light tracking-tighter tabular-nums transition-colors duration-500 ${theme.text}`}>
          {formattedTime}
        </span>
        <span className={`text-sm mt-2 font-medium uppercase tracking-widest transition-colors duration-500 ${theme.subtext}`}>
          {isActive ? 'Running' : 'Paused'}
        </span>
      </div>
    </div>
  );
};

export default CircularTimer;
