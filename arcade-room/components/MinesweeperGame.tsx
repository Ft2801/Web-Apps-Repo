import React, { useState, useEffect } from 'react';
import { createMineBoard, generateMines, revealMineCell, MineCell } from '../utils/gameUtils';
import Button from './Button';
import { ArrowLeft, Flag, Bomb, Shovel, RefreshCw } from 'lucide-react';

interface MinesweeperProps {
  onBack: () => void;
}

type MineDifficulty = 'NORMAL' | 'HARD';

const MinesweeperGame: React.FC<MinesweeperProps> = ({ onBack }) => {
  // Setup state
  const [difficulty, setDifficulty] = useState<MineDifficulty | null>(null);
  
  // Game state
  const [board, setBoard] = useState<MineCell[][]>([]);
  const [isGameActive, setIsGameActive] = useState(true);
  const [gameResult, setGameResult] = useState<'WIN' | 'LOSE' | null>(null);
  const [isFirstMove, setIsFirstMove] = useState(true);
  const [flagMode, setFlagMode] = useState(false);
  const [flagCount, setFlagCount] = useState(0);

  // Configuration based on difficulty
  // Increased HARD mines to 24 to ensure 3s and 4s appear more often (20% density)
  const config = difficulty === 'HARD' 
    ? { rows: 12, cols: 10, mines: 24 } 
    : { rows: 8, cols: 8, mines: 8 };

  useEffect(() => {
    if (difficulty) {
      setBoard(createMineBoard(config.rows, config.cols));
      setFlagCount(0);
      setIsFirstMove(true);
      setIsGameActive(true);
      setGameResult(null);
    }
  }, [difficulty]);

  const handleCellClick = (r: number, c: number) => {
    if(!isGameActive || (board[r][c].isRevealed)) return;

    const newBoard = board.map(row => row.map(cell => ({...cell})));

    if(flagMode) {
      // Toggle Flag
      if(!newBoard[r][c].isRevealed) {
        newBoard[r][c].isFlagged = !newBoard[r][c].isFlagged;
        setFlagCount(prev => newBoard[r][c].isFlagged ? prev + 1 : prev - 1);
        setBoard(newBoard);
      }
      return;
    }

    if(newBoard[r][c].isFlagged) return; // Cannot dig a flag

    if(isFirstMove) {
      generateMines(newBoard, config.rows, config.cols, config.mines, r, c);
      setIsFirstMove(false);
    }

    if(newBoard[r][c].isMine) {
      // Game Over Logic
      newBoard[r][c].isRevealed = true;
      // Reveal all mines
      newBoard.forEach(row => row.forEach(cell => {
        if(cell.isMine) cell.isRevealed = true;
      }));
      setBoard(newBoard);
      setGameResult('LOSE');
      setIsGameActive(false);
    } else {
      revealMineCell(newBoard, config.rows, config.cols, r, c);
      setBoard(newBoard);
      checkWin(newBoard);
    }
  };

  const checkWin = (currentBoard: MineCell[][]) => {
    let unrevealedSafeCells = 0;
    currentBoard.forEach(row => row.forEach(cell => {
      if(!cell.isMine && !cell.isRevealed) unrevealedSafeCells++;
    }));

    if(unrevealedSafeCells === 0) {
      setGameResult('WIN');
      setIsGameActive(false);
    }
  };

  const resetGame = () => {
    setBoard(createMineBoard(config.rows, config.cols));
    setIsGameActive(true);
    setGameResult(null);
    setIsFirstMove(true);
    setFlagCount(0);
  };

  const getCellColor = (count: number) => {
    switch(count) {
      case 1: return 'text-blue-400';
      case 2: return 'text-green-400';
      case 3: return 'text-red-400';
      case 4: return 'text-purple-400';
      case 5: return 'text-orange-400';
      default: return 'text-yellow-400';
    }
  };

  if (!difficulty) {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full max-w-md mx-auto p-4 animate-fade-in space-y-6">
             <div className="w-full flex justify-start mb-4">
                <Button variant="ghost" onClick={onBack} className="!px-3 !py-2">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
            </div>
            <h2 className="text-3xl font-bold text-white mb-8">Select Difficulty</h2>
            <Button fullWidth onClick={() => setDifficulty('NORMAL')} className="!py-6 text-xl">
                Normal (8x8)
            </Button>
            <Button fullWidth variant="danger" onClick={() => setDifficulty('HARD')} className="!py-6 text-xl">
                Hard (12x10)
            </Button>
        </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-full w-full max-w-md mx-auto p-4 animate-fade-in">
       <div className="w-full flex justify-between items-center mb-6">
         <Button variant="ghost" onClick={() => setDifficulty(null)} className="!px-3 !py-2">
            <ArrowLeft className="w-5 h-5" />
         </Button>
         <h2 className="text-xl font-bold text-slate-100">Minefield</h2>
         <div className="flex items-center gap-2 text-slate-300 font-mono bg-slate-800 px-3 py-1 rounded-lg">
             <Flag size={16} className="text-red-500" />
             <span>{config.mines - flagCount}</span>
         </div>
      </div>

      <div className="bg-slate-800 p-3 rounded-xl shadow-2xl relative max-h-[70vh] flex items-center justify-center">
        <div 
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${config.cols}, minmax(0, 1fr))` }}
        >
          {board.map((row, r) => (
            row.map((cell, c) => (
              <button
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                className={`
                  w-8 h-8 sm:w-9 sm:h-9 rounded-md flex items-center justify-center font-bold text-lg transition-all duration-150
                  ${!cell.isRevealed 
                    ? 'bg-slate-600 hover:bg-slate-500 shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.4)]' 
                    : cell.isMine 
                        ? 'bg-red-500/80' 
                        : 'bg-slate-700/50'
                  }
                `}
              >
                {cell.isFlagged && !cell.isRevealed && <Flag size={18} className="text-red-400" fill="currentColor" />}
                {cell.isRevealed && cell.isMine && <Bomb size={20} className="text-slate-900 animate-pulse" />}
                {cell.isRevealed && !cell.isMine && cell.neighborCount > 0 && (
                  <span className={getCellColor(cell.neighborCount)}>{cell.neighborCount}</span>
                )}
              </button>
            ))
          ))}
        </div>

        {gameResult && (
           <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl animate-fade-in z-10">
              <h3 className={`text-3xl font-bold mb-4 ${gameResult === 'WIN' ? 'text-green-400' : 'text-red-400'}`}>
                {gameResult === 'WIN' ? 'Cleared!' : 'Boom!'}
              </h3>
              <Button onClick={resetGame} variant="primary">
                 <RefreshCw className="mr-2 w-5 h-5" /> Retry
              </Button>
           </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-6 flex gap-3 w-full max-w-xs">
         <button 
            onClick={() => setFlagMode(false)}
            className={`flex-1 py-1 px-2 rounded-lg flex flex-col items-center gap-1 transition-all duration-200 border-2 ${!flagMode ? 'bg-blue-600 border-blue-400 text-white shadow-lg scale-105' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
         >
            <Shovel size={18} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Dig</span>
         </button>
         <button 
            onClick={() => setFlagMode(true)}
            className={`flex-1 py-1 px-2 rounded-lg flex flex-col items-center gap-1 transition-all duration-200 border-2 ${flagMode ? 'bg-red-600 border-red-400 text-white shadow-lg scale-105' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
         >
            <Flag size={18} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Flag</span>
         </button>
      </div>
    </div>
  );
};

export default MinesweeperGame;