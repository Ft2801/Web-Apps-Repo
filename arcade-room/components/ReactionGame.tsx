import React, { useState, useRef, useEffect } from 'react';
import Button from './Button';
import { ArrowLeft, Timer, Zap, AlertCircle } from 'lucide-react';

interface ReactionGameProps {
  onBack: () => void;
}

type GameState = 'WAITING' | 'READY' | 'CLICK' | 'RESULT' | 'TOO_EARLY';

const ReactionGame: React.FC<ReactionGameProps> = ({ onBack }) => {
  const [gameState, setGameState] = useState<GameState>('WAITING');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const timeoutRef = useRef<number | null>(null);
  
  // Prevent double-taps or rapid state skips
  const inputLocked = useRef(false);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
  }, []);

  const lockInput = (ms: number) => {
      inputLocked.current = true;
      setTimeout(() => { inputLocked.current = false; }, ms);
  };

  const startGame = () => {
    setGameState('READY');
    setReactionTime(null);
    lockInput(300); // Grace period to prevent immediate "Too Early" from the start click
    
    const randomDelay = Math.floor(Math.random() * 3000) + 2000; // 2-5 seconds
    
    timeoutRef.current = window.setTimeout(() => {
        setGameState('CLICK');
        startTimeRef.current = Date.now();
    }, randomDelay);
  };

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    // Only handle direct interaction on the game area
    if ((e.target as HTMLElement).closest('button')) return;
    
    // Prevent default on touch to stop ghost mouse events
    if (e.type === 'touchstart') {
       e.preventDefault(); 
    }

    if (inputLocked.current) return;

    if (gameState === 'WAITING') {
        startGame();
    } else if (gameState === 'READY') {
        // Clicked too early
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setGameState('TOO_EARLY');
        lockInput(500); // Penalty wait
    } else if (gameState === 'TOO_EARLY') {
        setGameState('WAITING');
        lockInput(200);
    } else if (gameState === 'CLICK') {
        // Success
        const endTime = Date.now();
        setReactionTime(endTime - startTimeRef.current);
        setGameState('RESULT');
        lockInput(500); // Prevent skipping the result screen accidentally
    } else if (gameState === 'RESULT') {
        setGameState('WAITING');
        lockInput(200);
    }
  };

  const getBackgroundColor = () => {
      switch(gameState) {
          case 'WAITING': return 'bg-slate-800';
          case 'READY': return 'bg-red-600';
          case 'CLICK': return 'bg-green-500';
          case 'RESULT': return 'bg-blue-600';
          case 'TOO_EARLY': return 'bg-yellow-600';
      }
  };

  const getMessage = () => {
      switch(gameState) {
          case 'WAITING': return 'Tap to Start';
          case 'READY': return 'Wait for Green...';
          case 'CLICK': return 'TAP NOW!';
          case 'RESULT': return `${reactionTime}ms`;
          case 'TOO_EARLY': return 'Too Early!';
      }
  };

  return (
    <div className="flex flex-col h-full w-full animate-fade-in relative">
        <div className="absolute top-4 left-4 z-20">
             <Button variant="ghost" onClick={onBack} className="!px-3 !py-2 bg-black/20 backdrop-blur-md">
                <ArrowLeft className="w-5 h-5 text-white" />
            </Button>
        </div>

        <div 
            onMouseDown={handleInteraction}
            onTouchStart={handleInteraction} 
            className={`
                absolute inset-0 w-full h-full flex flex-col items-center justify-center cursor-pointer select-none transition-colors duration-0 touch-none
                ${getBackgroundColor()}
            `}
        >
            <div className="text-white flex flex-col items-center gap-4 pointer-events-none px-4 text-center">
                {gameState === 'WAITING' && <Zap size={64} className="animate-pulse" />}
                {gameState === 'READY' && <div className="w-16 h-16 rounded-full border-4 border-white/30 animate-spin border-t-white" />}
                {gameState === 'CLICK' && <Zap size={80} className="scale-150" fill="currentColor" />}
                {gameState === 'RESULT' && <Timer size={64} />}
                {gameState === 'TOO_EARLY' && <AlertCircle size={64} />}
                
                <h1 className="text-5xl font-black tracking-tight drop-shadow-lg">
                    {getMessage()}
                </h1>
                
                {gameState === 'RESULT' && (
                    <p className="text-blue-200 mt-4 text-lg font-medium animate-pulse">Tap to reset</p>
                )}
                 {gameState === 'WAITING' && (
                    <p className="text-slate-400 mt-2">Test your visual reflexes</p>
                )}
                 {gameState === 'TOO_EARLY' && (
                    <p className="text-yellow-100 mt-2 font-medium">Wait for the green screen!</p>
                )}
            </div>
        </div>
    </div>
  );
};

export default ReactionGame;