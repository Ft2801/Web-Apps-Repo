import React, { useState } from 'react';
import { RPSMove, getRPSComputerMove, getRPSWinner } from '../utils/gameUtils';
import Button from './Button';
import { ArrowLeft, StickyNote, Scissors, Circle } from 'lucide-react';

interface RPSProps {
  onBack: () => void;
}

const RockPaperScissorsGame: React.FC<RPSProps> = ({ onBack }) => {
  const [history, setHistory] = useState<RPSMove[]>([]);
  const [playerMove, setPlayerMove] = useState<RPSMove | null>(null);
  const [computerMove, setComputerMove] = useState<RPSMove | null>(null);
  const [result, setResult] = useState<'PLAYER' | 'COMPUTER' | 'DRAW' | null>(null);
  const [score, setScore] = useState({ player: 0, computer: 0 });
  const [isRevealing, setIsRevealing] = useState(false);

  const handleMove = (move: RPSMove) => {
    if (isRevealing) return;
    
    setIsRevealing(true);
    setPlayerMove(move);
    setResult(null);
    setComputerMove(null);

    // Simulate thinking/reveal delay
    setTimeout(() => {
        const cpuMove = getRPSComputerMove(history);
        setComputerMove(cpuMove);
        
        const gameResult = getRPSWinner(move, cpuMove);
        setResult(gameResult);
        
        if (gameResult === 'PLAYER') setScore(s => ({ ...s, player: s.player + 1 }));
        if (gameResult === 'COMPUTER') setScore(s => ({ ...s, computer: s.computer + 1 }));
        
        setHistory(prev => [...prev, move]);
        setIsRevealing(false);
    }, 600);
  };

  // Helper to render icon with a specific color class
  const getIcon = (move: RPSMove | null, colorClass: string, size = 48) => {
      if (!move) return <div className="w-12 h-12" />; // Spacer
      switch(move) {
          case 'ROCK': return <Circle size={size} className={colorClass} strokeWidth={2.5} />;
          case 'PAPER': return <StickyNote size={size} className={colorClass} strokeWidth={2.5} />;
          case 'SCISSORS': return <Scissors size={size} className={colorClass} strokeWidth={2.5} />;
      }
  };

  const getResultText = () => {
      if (!result) return "Choose your weapon";
      if (result === 'DRAW') return "It's a Draw!";
      if (result === 'PLAYER') return "You Win!";
      return "Computer Wins!";
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full max-w-md mx-auto p-4 animate-fade-in">
       <div className="w-full flex justify-between items-center mb-6">
         <Button variant="ghost" onClick={onBack} className="!px-3 !py-2">
            <ArrowLeft className="w-5 h-5" />
         </Button>
         <h2 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
            RPS
         </h2>
         <div className="w-10"></div>
      </div>

      {/* Scoreboard */}
      <div className="flex w-full justify-between px-4 mb-8 text-xl font-bold">
          <div className="text-blue-400 flex flex-col items-center">
              <span>You</span>
              <span className="text-3xl">{score.player}</span>
          </div>
          <div className="text-red-400 flex flex-col items-center">
              <span>CPU</span>
              <span className="text-3xl">{score.computer}</span>
          </div>
      </div>

      {/* Arena */}
      <div className="flex justify-between items-center w-full mb-12 px-2">
          {/* Player Side - Always Blue */}
          <div className="flex flex-col items-center gap-2">
               <div className={`transition-all duration-300 ${isRevealing ? 'scale-110' : ''}`}>
                    {getIcon(playerMove, 'text-blue-400', 80)}
               </div>
               <span className="text-sm text-slate-400">You</span>
          </div>

          <div className="text-2xl font-black text-slate-500">VS</div>

          {/* CPU Side - Always Red */}
          <div className="flex flex-col items-center gap-2">
               <div className={`transition-all duration-300 ${isRevealing ? 'animate-pulse' : ''}`}>
                    {isRevealing ? <div className="w-20 h-20 bg-slate-800 rounded-full animate-ping" /> : getIcon(computerMove, 'text-red-400', 80)}
               </div>
               <span className="text-sm text-slate-400">CPU</span>
          </div>
      </div>

      <div className="mb-8 text-2xl font-bold text-slate-200 h-8 text-center">
          {getResultText()}
      </div>

      {/* Controls - Neutral Colors */}
      <div className="grid grid-cols-3 gap-4 w-full">
          <button 
            disabled={isRevealing}
            onClick={() => handleMove('ROCK')}
            className="bg-slate-800 hover:bg-slate-700 p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
              <Circle size={32} className="text-slate-200" strokeWidth={2.5} />
              <span className="font-bold text-slate-200">Rock</span>
          </button>
          <button 
            disabled={isRevealing}
            onClick={() => handleMove('PAPER')}
            className="bg-slate-800 hover:bg-slate-700 p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
              <StickyNote size={32} className="text-slate-200" strokeWidth={2.5} />
              <span className="font-bold text-slate-200">Paper</span>
          </button>
          <button 
            disabled={isRevealing}
            onClick={() => handleMove('SCISSORS')}
            className="bg-slate-800 hover:bg-slate-700 p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
              <Scissors size={32} className="text-slate-200" strokeWidth={2.5} />
              <span className="font-bold text-slate-200">Scissors</span>
          </button>
      </div>
    </div>
  );
};

export default RockPaperScissorsGame;