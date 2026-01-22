import React, { useState, useEffect, useRef } from 'react';
import { TimerMode } from './types';
import { TIMER_DURATIONS, THEMES } from './constants';
import { playNotification } from './utils/sound';
import CircularTimer from './components/CircularTimer';
import Controls from './components/Controls';

const App: React.FC = () => {
  // --- State ---
  const [mode, setMode] = useState<TimerMode>(TimerMode.FOCUS);
  const [timeLeft, setTimeLeft] = useState<number>(TIMER_DURATIONS[TimerMode.FOCUS]);
  const [isActive, setIsActive] = useState<boolean>(false);
  
  // Custom time state (Minutes and Seconds)
  const [customTime, setCustomTime] = useState({ minutes: 20, seconds: 0 });
  
  // Ref for handling the interval
  const timerRef = useRef<number | null>(null);

  // --- Computed ---
  const theme = THEMES[mode];
  
  // Calculate total time based on mode
  const totalTime = mode === TimerMode.CUSTOM 
    ? (customTime.minutes * 60) + customTime.seconds
    : TIMER_DURATIONS[mode];

  // --- Effects ---

  // Handle Mode Change
  const handleModeChange = (newMode: TimerMode) => {
    setMode(newMode);
    setIsActive(false);
    
    // Set time based on mode logic
    if (newMode === TimerMode.CUSTOM) {
      setTimeLeft((customTime.minutes * 60) + customTime.seconds);
    } else {
      setTimeLeft(TIMER_DURATIONS[newMode]);
    }
  };

  // Timer Logic
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, timeLeft]);

  // --- Handlers ---

  const handleCustomTimeChange = (field: 'minutes' | 'seconds', value: string) => {
    let val = parseInt(value);
    if (isNaN(val)) val = 0;
    
    // Validate bounds
    if (field === 'minutes') {
      if (val > 120) val = 120;
      if (val < 0) val = 0;
    } else {
      if (val > 59) val = 59;
      if (val < 0) val = 0;
    }

    const newTime = { ...customTime, [field]: val };
    setCustomTime(newTime);
    
    // Immediate update of the timer visual
    setTimeLeft((newTime.minutes * 60) + newTime.seconds);
    setIsActive(false);
  };

  const handleTimerComplete = () => {
    setIsActive(false);
    if (timerRef.current) window.clearInterval(timerRef.current);
    playNotification();
  };

  const toggleTimer = () => {
    // Prevent starting 0 time
    if (timeLeft === 0 && !isActive) {
        if (mode === TimerMode.CUSTOM) {
            setTimeLeft((customTime.minutes * 60) + customTime.seconds);
        } else {
            setTimeLeft(TIMER_DURATIONS[mode]);
        }
        setIsActive(true);
        return;
    }
    
    if (timeLeft <= 0) return;
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(totalTime);
  };

  return (
    <div className={`min-h-screen w-full transition-colors duration-700 ease-in-out flex flex-col items-center justify-center p-6 ${theme.background}`}>
      
      {/* Header */}
      <header className="mb-6 landscape:mb-2 flex justify-center w-full">
        <h1 className={`text-3xl font-light tracking-widest uppercase ${theme.text} opacity-80`}>
          Focus Flow
        </h1>
      </header>

      {/* Main Content - Flex Col for Portrait, Flex Row for Landscape */}
      <main className="flex flex-col landscape:flex-row items-center justify-center w-full max-w-5xl z-10 gap-2 landscape:gap-20">
        
        {/* Left Side (in Landscape): Timer */}
        <div className="flex-shrink-0">
          <CircularTimer 
            timeLeft={timeLeft} 
            totalTime={totalTime} 
            isActive={isActive} 
            theme={theme}
          />
        </div>
        
        {/* Right Side (in Landscape): Controls and Inputs */}
        <div className="flex flex-col items-center w-full max-w-md">
            
            {/* Fixed Height Container for Custom Inputs */}
            <div className="h-16 w-full flex justify-center items-center mt-2 mb-2">
                {mode === TimerMode.CUSTOM && !isActive && (
                  <div className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-300">
                    <input
                      type="number"
                      min="0"
                      max="120"
                      value={customTime.minutes}
                      onChange={(e) => handleCustomTimeChange('minutes', e.target.value)}
                      className={`
                        w-16 text-center bg-white/40 backdrop-blur-md rounded-lg py-2
                        text-xl font-medium outline-none focus:ring-2 ring-offset-0 
                        transition-all appearance-none [&::-webkit-inner-spin-button]:appearance-none m-0
                        ${theme.text} ${theme.ring}
                      `}
                    />
                    <span className={`text-xl font-light ${theme.text} -mt-1`}>:</span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={customTime.seconds}
                      onChange={(e) => handleCustomTimeChange('seconds', e.target.value)}
                      className={`
                        w-16 text-center bg-white/40 backdrop-blur-md rounded-lg py-2 
                        text-xl font-medium outline-none focus:ring-2 ring-offset-0 
                        transition-all appearance-none [&::-webkit-inner-spin-button]:appearance-none m-0
                        ${theme.text} ${theme.ring}
                      `}
                    />
                  </div>
                )}
            </div>

            <Controls 
              isActive={isActive}
              onToggle={toggleTimer}
              onReset={resetTimer}
              currentMode={mode}
              onModeChange={handleModeChange}
              theme={theme}
            />
        </div>
        
      </main>

      {/* Footer Ambient Detail */}
      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-10 pointer-events-none" style={{ color: theme.text.replace('text-', 'bg-') }} />
    </div>
  );
};

export default App;