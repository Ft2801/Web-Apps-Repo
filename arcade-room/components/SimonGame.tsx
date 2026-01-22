import React, { useState, useEffect, useRef } from 'react';
import Button from './Button';
import { ArrowLeft, Play } from 'lucide-react';

interface SimonGameProps {
  onBack: () => void;
}

type Color = 'GREEN' | 'RED' | 'YELLOW' | 'BLUE';
const COLORS: Color[] = ['GREEN', 'RED', 'YELLOW', 'BLUE'];

const SimonGame: React.FC<SimonGameProps> = ({ onBack }) => {
  const [sequence, setSequence] = useState<Color[]>([]);
  const [userStep, setUserStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDemonstrating, setIsDemonstrating] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [activeColor, setActiveColor] = useState<Color | null>(null);
  const [score, setScore] = useState(0);

  const startGame = () => {
      setSequence([]);
      setUserStep(0);
      setScore(0);
      setGameOver(false);
      setIsPlaying(true);
      
      // Start first round with a small delay
      setTimeout(() => startRound([]), 500);
  };

  const startRound = (currentSeq: Color[]) => {
      // Pure random selection from the 4 colors
      const randomIndex = Math.floor(Math.random() * 4);
      const nextColor = COLORS[randomIndex];
      
      const newSeq = [...currentSeq, nextColor];
      setSequence(newSeq);
      setUserStep(0);
      setIsDemonstrating(true);
      demonstrateSequence(newSeq);
  };

  // Helper to wait
  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const demonstrateSequence = async (seq: Color[]) => {
      await wait(500); // Initial pause before starting

      for (let i = 0; i < seq.length; i++) {
          setActiveColor(seq[i]); // Light ON
          await wait(600); 
          
          setActiveColor(null); // Light OFF
          await wait(200); // Gap between lights (crucial for same-color repeats)
      }

      setIsDemonstrating(false);
  };

  const flashColor = (color: Color) => {
      setActiveColor(color);
      setTimeout(() => setActiveColor(null), 300);
  };

  const handleColorClick = (color: Color) => {
      if (!isPlaying || isDemonstrating || gameOver) return;

      flashColor(color);

      if (color !== sequence[userStep]) {
          setGameOver(true);
          setIsPlaying(false);
          return;
      }

      const nextStep = userStep + 1;
      if (nextStep === sequence.length) {
          setScore(s => s + 1);
          setIsDemonstrating(true); // Prevent clicks while preparing next round
          setTimeout(() => startRound(sequence), 1000);
      } else {
          setUserStep(nextStep);
      }
  };

  const getColorStyles = (color: Color) => {
      const base = "w-full h-full rounded-2xl transition-all duration-100 active:scale-95 shadow-lg border-4 border-transparent";
      const isActive = activeColor === color;
      
      switch(color) {
          case 'GREEN': return `${base} bg-green-600 ${isActive ? 'bg-green-400 shadow-green-400/50 scale-95 border-white' : ''}`;
          case 'RED': return `${base} bg-red-600 ${isActive ? 'bg-red-400 shadow-red-400/50 scale-95 border-white' : ''}`;
          case 'YELLOW': return `${base} bg-yellow-500 ${isActive ? 'bg-yellow-300 shadow-yellow-300/50 scale-95 border-white' : ''}`;
          case 'BLUE': return `${base} bg-blue-600 ${isActive ? 'bg-blue-400 shadow-blue-400/50 scale-95 border-white' : ''}`;
      }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full max-w-md mx-auto p-4 animate-fade-in">
       <div className="w-full flex justify-between items-center mb-6">
         <Button variant="ghost" onClick={onBack} className="!px-3 !py-2">
            <ArrowLeft className="w-5 h-5" />
         </Button>
         <h2 className="text-2xl font-bold text-slate-100">
            Simon Says
         </h2>
         <div className="text-slate-400 font-mono text-sm">Score: {score}</div>
      </div>

      <div className="relative w-full aspect-square max-w-sm mb-8">
          <div className="grid grid-cols-2 grid-rows-2 gap-4 w-full h-full p-4">
              <button onClick={() => handleColorClick('GREEN')} className={getColorStyles('GREEN')} />
              <button onClick={() => handleColorClick('RED')} className={getColorStyles('RED')} />
              <button onClick={() => handleColorClick('YELLOW')} className={getColorStyles('YELLOW')} />
              <button onClick={() => handleColorClick('BLUE')} className={getColorStyles('BLUE')} />
          </div>
          
          {/* Center Display */}
          <div className="absolute inset-0 m-auto w-1/3 h-1/3 bg-slate-900 rounded-full border-4 border-slate-800 flex items-center justify-center z-10 shadow-2xl">
              {!isPlaying && !gameOver && (
                  <button onClick={startGame} className="flex flex-col items-center text-slate-300 hover:text-white">
                      <Play size={32} />
                      <span className="text-xs font-bold mt-1">START</span>
                  </button>
              )}
              {isDemonstrating && <span className="text-xs text-slate-400 animate-pulse">WATCH</span>}
              {!isDemonstrating && isPlaying && <span className="text-xs text-green-400">PLAY</span>}
              {gameOver && <span className="text-xl font-bold text-red-500">GAME OVER</span>}
          </div>
      </div>

      <div className="text-center text-slate-400 h-8">
          {gameOver ? "Tap Start to try again" : isDemonstrating ? "Memorize the sequence..." : isPlaying ? "Repeat the sequence!" : "Press Start to play"}
      </div>
    </div>
  );
};

export default SimonGame;