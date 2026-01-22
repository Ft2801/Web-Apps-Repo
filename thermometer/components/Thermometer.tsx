import React from 'react';
import { getPercentage } from '../utils/weatherHelpers';

interface ThermometerProps {
  temp: number;
  min: number;
  max: number;
  liquidColor: string;
  isDragging?: boolean;
}

const Thermometer: React.FC<ThermometerProps> = ({ temp, min, max, liquidColor, isDragging = false }) => {
  const percent = getPercentage(temp, min, max);
  
  // SVG Configuration
  const svgHeight = 300;
  const tubeTopY = 10;
  const tubeBottomY = 260;
  const tubeHeightAvailable = tubeBottomY - tubeTopY; 
  
  // Calculate fill height.
  const maxFillHeight = tubeHeightAvailable - 15; 
  const currentHeight = (percent / 100) * maxFillHeight;

  // Determine transition style based on dragging state
  // When dragging, we want instant updates (no transition). 
  // When clicking or snapping, we want a smooth transition.
  const transitionClass = isDragging ? 'transition-none' : 'transition-all duration-300 ease-out';
  const colorTransitionClass = isDragging ? 'transition-none' : 'transition-colors duration-500 ease-out';

  return (
    <div className="relative w-24 h-80 md:w-32 md:h-96 filter drop-shadow-xl transition-transform duration-300 hover:scale-105">
      <svg
        viewBox="0 0 100 300"
        className="w-full h-full overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id="tube-clip">
             <rect x="35" y="10" width="30" height="250" rx="15" />
             <circle cx="50" cy="260" r="35" />
          </clipPath>
        </defs>

        {/* Glass Tube Background */}
        <rect x="35" y="10" width="30" height="250" rx="15" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
        <circle cx="50" cy="260" r="35" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />

        {/* Measurement Lines */}
        <g stroke="rgba(255,255,255,0.5)" strokeWidth="2">
          <line x1="65" y1="40" x2="80" y2="40" />
          <line x1="65" y1="90" x2="80" y2="90" />
          <line x1="65" y1="140" x2="80" y2="140" />
          <line x1="65" y1="190" x2="80" y2="190" />
        </g>

        {/* Liquid Group */}
        <g>
            {/* Liquid Bulb */}
            <circle 
                cx="50" 
                cy="260" 
                r="28" 
                fill={liquidColor} 
                className={colorTransitionClass}
            />
            
            {/* Liquid Stem */}
            <rect 
            x="38" 
            y={260 - currentHeight} 
            width="24" 
            height={currentHeight} 
            rx="12"
            fill={liquidColor}
            className={transitionClass}
            />
            
            {/* Patch Rect */}
            <rect
                x="38"
                y={250}
                width="24"
                height="20"
                fill={liquidColor}
                className={colorTransitionClass}
            />
        </g>
        
        {/* Shine/Reflection on Glass */}
        <path d="M 42 20 L 42 240" stroke="rgba(255,255,255,0.2)" strokeWidth="4" strokeLinecap="round" />
        <path d="M 35 250 Q 30 260 35 275" stroke="rgba(255,255,255,0.2)" strokeWidth="3" strokeLinecap="round" fill="none" />

      </svg>
    </div>
  );
};

export default Thermometer;