import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Unit } from './types';
import { celsiusToFahrenheit, getWeatherState, getTempStyle } from './utils/weatherHelpers';
import WeatherOverlay from './components/WeatherOverlay';
import Thermometer from './components/Thermometer';
import { Snowflake, Flame, Sun, CloudRain, Wind, Settings } from 'lucide-react';

// Constants
const MIN_TEMP = -50;
const MAX_TEMP = 100;

const App: React.FC = () => {
  const [temperature, setTemperature] = useState<number>(20);
  const [unit, setUnit] = useState<Unit>('C');
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLInputElement>(null);

  // Derived state for UI labels
  const weatherState = getWeatherState(temperature);
  const displayTemp = unit === 'C' ? temperature : celsiusToFahrenheit(temperature);
  
  // Dynamic smooth styles
  const currentStyle = getTempStyle(temperature);

  // Initialize Slider Visuals on mount
  useEffect(() => {
    if (sliderRef.current) {
        updateSliderVisuals(temperature, currentStyle.liquidColor);
    }
  }, []); // Run once on mount

  const updateSliderVisuals = (temp: number, color: string) => {
    if (sliderRef.current) {
      const percent = ((temp - MIN_TEMP) / (MAX_TEMP - MIN_TEMP)) * 100;
      sliderRef.current.style.backgroundSize = `${percent}% 100%`;
      sliderRef.current.style.backgroundImage = `linear-gradient(to right, ${color}, ${color})`;
    }
  };

  // Handlers
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    
    // REAL-TIME VISUAL UPDATE:
    // Calculate color immediately to avoid waiting for React render cycle
    const dynamicStyle = getTempStyle(val);
    
    // Update Slider Track immediately
    if (sliderRef.current) {
        const percent = ((val - MIN_TEMP) / (MAX_TEMP - MIN_TEMP)) * 100;
        sliderRef.current.style.backgroundSize = `${percent}% 100%`;
        sliderRef.current.style.backgroundImage = `linear-gradient(to right, ${dynamicStyle.liquidColor}, ${dynamicStyle.liquidColor})`;
    }

    setTemperature(val);
  };

  const toggleUnit = () => {
    setUnit((prev) => (prev === 'C' ? 'F' : 'C'));
  };

  // Icon mapping
  const renderIcon = () => {
    const size = 32;
    const color = "white";
    switch (weatherState.icon) {
      case 'snowflake-heavy': return <Snowflake size={size} color={color} className="animate-pulse" />;
      case 'snowflake': return <Snowflake size={size} color={color} />;
      case 'cloud-rain': return <CloudRain size={size} color={color} />;
      case 'sun': return <Sun size={size} color={color} className="animate-spin-slow" />;
      case 'sun-medium': return <Sun size={size} color={color} />;
      case 'flame': return <Flame size={size} color={color} className="animate-bounce" />;
      default: return <Wind size={size} color={color} />;
    }
  };

  return (
    <div 
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden"
      style={{ 
          background: currentStyle.bgGradient,
          // Disable transition during drag for instant responsiveness, enable it otherwise for smoothness
          transition: isDragging ? 'none' : 'background 0.5s ease-out' 
      }}
    >
      
      {/* Background Weather Effects - z-50 to overlay everything */}
      <WeatherOverlay temp={temperature} />

      {/* Main Glass Card - z-20 */}
      <div className="relative z-20 flex flex-col md:flex-row items-center gap-8 md:gap-12 p-6 md:p-16 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl max-w-4xl w-full mx-4 my-4">
        
        {/* Left Side: Thermometer Visual */}
        <div className="flex-shrink-0 mt-4 md:mt-0">
          <Thermometer 
            temp={temperature} 
            min={MIN_TEMP} 
            max={MAX_TEMP} 
            liquidColor={currentStyle.liquidColor} 
            isDragging={isDragging}
          />
        </div>

        {/* Right Side: Controls and Info */}
        <div className="flex-1 flex flex-col items-center md:items-start text-white w-full">
          
          {/* Header & Status */}
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-white/20 rounded-full shadow-inner backdrop-blur-sm">
               {renderIcon()}
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-sm md:text-xl font-light opacity-80 uppercase tracking-widest">Status</h2>
              <h1 className="text-2xl md:text-4xl font-bold drop-shadow-sm min-w-[200px]">{weatherState.label}</h1>
            </div>
          </div>

          <div className="h-px w-full bg-white/30 my-6" />

          {/* Temperature Display */}
          <div className="flex items-baseline gap-2 mb-8">
             <span className="text-6xl md:text-8xl font-black tracking-tighter drop-shadow-lg tabular-nums">
               {displayTemp}
             </span>
             <span className="text-2xl md:text-4xl font-medium opacity-80">
               °{unit}
             </span>
          </div>

          {/* Slider Control */}
          <div className="w-full mb-8">
            <div className="flex justify-between text-xs font-medium opacity-70 mb-2">
               <span>-50°C</span>
               <span>0°C</span>
               <span>100°C</span>
            </div>
            <input
              ref={sliderRef}
              type="range"
              min={MIN_TEMP}
              max={MAX_TEMP}
              value={temperature}
              onChange={handleSliderChange}
              onMouseDown={() => setIsDragging(true)}
              onMouseUp={() => setIsDragging(false)}
              className="w-full h-4 bg-white/20 rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50"
              style={{
                backgroundRepeat: 'no-repeat',
                // Style initialized via Effect, updated via onChange
              }}
            />
            <p className="text-center text-sm mt-3 opacity-60">
              Drag to change temperature
            </p>
          </div>

          {/* Unit Toggle */}
          <button
            onClick={toggleUnit}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/30 rounded-full transition-all text-xs md:text-sm font-semibold uppercase tracking-wider backdrop-blur-sm"
          >
            <Settings size={16} />
            Switch to °{unit === 'C' ? 'Fahrenheit' : 'Celsius'}
          </button>
        </div>
      </div>

      {/* Footer Credits */}
      <div className="absolute bottom-4 text-white/40 text-xs font-light z-10 pointer-events-none">
        Interactive Design &copy; {new Date().getFullYear()}
      </div>

      <style>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          margin-top: -0px; 
          box-shadow: 0 0 10px rgba(0,0,0,0.3);
          transition: transform 0.1s;
        }
        input[type=range]::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }
      `}</style>
    </div>
  );
};

export default App;