import React, { useState, useEffect, useRef } from 'react';
import Button from './Button';
import { ArrowLeft, Play, Zap, Timer } from 'lucide-react';

interface WhackAMoleGameProps {
  onBack: () => void;
}

const GAME_DURATION = 30; // seconds

const WhackAMoleGame: React.FC<WhackAMoleGameProps> = ({ onBack }) => {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startGame = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setIsPlaying(true);
    setGameOver(false);
    spawnLight();
    
    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const endGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPlaying(false);
    setGameOver(true);
    setActiveIdx(null);
  };

  const spawnLight = () => {
    // Pick a random index 0-8 that isn't the current one (to ensure movement)
    let newIdx;
    do {
      newIdx = Math.floor(Math.random() * 9);
    } while (newIdx === activeIdx);
    
    setActiveIdx(newIdx);
  };

  const handleCellClick = (idx: number) => {
    if (!isPlaying) return;

    if (idx === activeIdx) {
      setScore(s => s + 1);
      // Visual feedback could go here
      spawnLight();
    } else {
        // Optional penalty? For now, just nothing
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full max-w-md mx-auto p-4 animate-fade-in">
       <div className="w-full flex justify-between items-center mb-6">
         <Button variant="ghost" onClick={onBack} className="!px-3 !py-2">
            <ArrowLeft className="w-5 h-5" />
         </Button>
         <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Whack-a-Light
         </h2>
         <div className="flex items-center gap-2 text-slate-300 font-mono">
             <Timer size={16} />
             <span>{timeLeft}s</span>
         </div>
      </div>

      <div className="mb-4 text-3xl font-bold text-white">
          {score} <span className="text-sm text-slate-500 font-normal">pts</span>
      </div>

      <div className="grid grid-cols-3 gap-3 w-full aspect-square bg-slate-800 p-3 rounded-2xl shadow-2xl relative">
        {/* Game Over Overlay */}
        {gameOver && (
            <div className="absolute inset-0 z-20 bg-slate-900/90 rounded-2xl flex flex-col items-center justify-center animate-fade-in">
                <h3 className="text-3xl font-bold text-white mb-2">Time's Up!</h3>
                <p className="text-slate-400 mb-6">Final Score: <span className="text-cyan-400 font-bold">{score}</span></p>
                <Button onClick={startGame} variant="primary">
                    <Play className="mr-2 w-5 h-5" /> Play Again
                </Button>
            </div>
        )}

        {!isPlaying && !gameOver && (
             <div className="absolute inset-0 z-20 bg-slate-900/80 rounded-2xl flex flex-col items-center justify-center">
                 <Button onClick={startGame} variant="primary" className="scale-125">
                    <Play className="mr-2 w-5 h-5" /> Start
                </Button>
             </div>
        )}

        {Array(9).fill(null).map((_, idx) => (
          <button
            key={idx}
            onClick={() => handleCellClick(idx)}
            className={`
              relative rounded-xl transition-all duration-100
              ${idx === activeIdx 
                ? 'bg-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.6)] scale-95 border-2 border-white' 
                : 'bg-slate-700 shadow-inner'
              }
            `}
          >
              {idx === activeIdx && (
                  <Zap className="absolute inset-0 m-auto text-white w-8 h-8 animate-pulse" fill="currentColor" />
              )}
          </button>
        ))}
      </div>

      <div className="mt-8 text-center text-slate-400 text-sm">
          Tap the glowing lights as fast as you can!
      </div>
    </div>
  );
};

export default WhackAMoleGame;