import React, { useState, useEffect, useCallback, useRef } from 'react';
import Button from './Button';
import { ArrowLeft, RefreshCw, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface Puzzle2048Props {
  onBack: () => void;
}

const SIZE = 4;

// Helper functions
const transpose = (matrix: number[][]) => matrix[0].map((_, i) => matrix.map(row => row[i]));
const reverseRows = (matrix: number[][]) => matrix.map(row => [...row].reverse());

const Puzzle2048Game: React.FC<Puzzle2048Props> = ({ onBack }) => {
  const [board, setBoard] = useState<number[][]>([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const initialized = useRef(false);

  // Initialize only once or on manual reset
  const initGame = useCallback(() => {
    const newBoard = Array(SIZE).fill(null).map(() => Array(SIZE).fill(0));
    addRandomTile(newBoard);
    addRandomTile(newBoard);
    setBoard(newBoard);
    setScore(0);
    setGameOver(false);
  }, []);

  useEffect(() => {
    if (!initialized.current) {
        initGame();
        initialized.current = true;
    }
  }, [initGame]);

  const addRandomTile = (currentBoard: number[][]) => {
    const emptyCells = [];
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (currentBoard[r][c] === 0) emptyCells.push({ r, c });
      }
    }
    if (emptyCells.length === 0) return;

    const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    currentBoard[r][c] = Math.random() < 0.9 ? 2 : 4;
  };

  const slideRow = (row: number[]) => {
    // 1. Remove zeros
    let arr = row.filter(val => val !== 0);
    let gainedScore = 0;

    // 2. Merge
    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] === arr[i+1]) {
            arr[i] *= 2;
            gainedScore += arr[i];
            arr[i+1] = 0; // Mark as merged
        }
    }

    // 3. Remove zeros again (from merges)
    arr = arr.filter(val => val !== 0);

    // 4. Pad with zeros
    while (arr.length < SIZE) arr.push(0);

    return { arr, gainedScore };
  };

  const move = (direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    if (gameOver) return;

    let transformedBoard = board.map(r => [...r]); // Copy

    // Transform board so we can always slide LEFT
    if (direction === 'UP') transformedBoard = transpose(transformedBoard);
    else if (direction === 'DOWN') transformedBoard = reverseRows(transpose(transformedBoard));
    else if (direction === 'RIGHT') transformedBoard = reverseRows(transformedBoard);
    // LEFT is default

    let totalGainedScore = 0;
    const processedBoard = transformedBoard.map(row => {
        const { arr, gainedScore } = slideRow(row);
        totalGainedScore += gainedScore;
        return arr;
    });

    // Transform back to original orientation
    let finalBoard = processedBoard;
    if (direction === 'UP') finalBoard = transpose(finalBoard);
    else if (direction === 'DOWN') finalBoard = transpose(reverseRows(finalBoard));
    else if (direction === 'RIGHT') finalBoard = reverseRows(finalBoard);

    // Check if board changed
    if (JSON.stringify(board) !== JSON.stringify(finalBoard)) {
        addRandomTile(finalBoard);
        setBoard(finalBoard);
        setScore(s => {
            const newScore = s + totalGainedScore;
            if (newScore > bestScore) setBestScore(newScore);
            return newScore;
        });
        checkGameOver(finalBoard);
    }
  };

  const checkGameOver = (currentBoard: number[][]) => {
    // Check for zeros
    for(let r=0; r<SIZE; r++)
        for(let c=0; c<SIZE; c++)
            if(currentBoard[r][c] === 0) return;

    // Check for possible merges
    for(let r=0; r<SIZE; r++) {
        for(let c=0; c<SIZE; c++) {
            const val = currentBoard[r][c];
            if(c < SIZE-1 && currentBoard[r][c+1] === val) return; // Check Right
            if(r < SIZE-1 && currentBoard[r+1][c] === val) return; // Check Down
        }
    }
    setGameOver(true);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch(e.key) {
        case 'ArrowUp': e.preventDefault(); move('UP'); break;
        case 'ArrowDown': e.preventDefault(); move('DOWN'); break;
        case 'ArrowLeft': e.preventDefault(); move('LEFT'); break;
        case 'ArrowRight': e.preventDefault(); move('RIGHT'); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [board, gameOver, score]); // Dependencies need to be current for move closure if not using refs, but setBoard uses functional update so 'board' dep might be okay if using JSON.stringify on 'board'

  const getTileColor = (val: number) => {
    switch(val) {
        case 0: return 'bg-slate-700/50';
        case 2: return 'bg-slate-200 text-slate-800';
        case 4: return 'bg-orange-100 text-slate-800';
        case 8: return 'bg-orange-300 text-white';
        case 16: return 'bg-orange-500 text-white';
        case 32: return 'bg-orange-600 text-white';
        case 64: return 'bg-red-500 text-white';
        case 128: return 'bg-yellow-400 text-white shadow-[0_0_10px_#facc15]';
        case 256: return 'bg-yellow-500 text-white shadow-[0_0_15px_#eab308]';
        case 512: return 'bg-yellow-600 text-white shadow-[0_0_20px_#ca8a04]';
        case 1024: return 'bg-purple-500 text-white shadow-[0_0_20px_#a855f7]';
        case 2048: return 'bg-purple-700 text-white shadow-[0_0_25px_#7e22ce]';
        default: return 'bg-black text-white';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full max-w-md mx-auto p-4 animate-fade-in touch-none">
       <div className="w-full flex justify-between items-center mb-6">
         <Button variant="ghost" onClick={onBack} className="!px-3 !py-2">
            <ArrowLeft className="w-5 h-5" />
         </Button>
         <div className="flex flex-col items-center">
             <h2 className="text-3xl font-bold text-white tracking-widest">2048</h2>
         </div>
         <Button variant="ghost" onClick={initGame} className="!px-3 !py-2">
            <RefreshCw className="w-5 h-5" />
         </Button>
      </div>

      <div className="flex gap-4 mb-8 w-full justify-center">
          <div className="bg-slate-800 p-3 rounded-lg min-w-[100px] text-center shadow-lg">
              <div className="text-xs text-slate-400 uppercase font-bold">Score</div>
              <div className="text-xl font-bold text-white">{score}</div>
          </div>
          <div className="bg-slate-800 p-3 rounded-lg min-w-[100px] text-center shadow-lg">
              <div className="text-xs text-slate-400 uppercase font-bold">Best</div>
              <div className="text-xl font-bold text-white">{bestScore}</div>
          </div>
      </div>

      <div className="bg-slate-800 p-3 rounded-xl shadow-2xl relative w-full aspect-square max-w-sm border border-slate-700">
        {gameOver && (
            <div className="absolute inset-0 z-20 bg-slate-900/80 rounded-xl flex flex-col items-center justify-center animate-fade-in backdrop-blur-sm">
                <h3 className="text-4xl font-bold text-white mb-2">Game Over</h3>
                <p className="text-slate-300 mb-6">Score: {score}</p>
                <Button onClick={initGame} variant="primary">
                    <RefreshCw className="mr-2 w-5 h-5" /> Try Again
                </Button>
            </div>
        )}

        <div className="grid grid-cols-4 grid-rows-4 gap-2 w-full h-full">
            {board.map((row, r) => (
                row.map((val, c) => (
                    <div 
                        key={`${r}-${c}`}
                        className={`
                            rounded-md flex items-center justify-center font-bold text-2xl transition-all duration-200
                            ${getTileColor(val)}
                            ${val > 0 ? 'scale-100 shadow-md' : 'scale-100'}
                        `}
                    >
                        {val > 0 ? val : ''}
                    </div>
                ))
            ))}
        </div>
      </div>

      {/* Mobile Controls */}
      <div className="mt-8 grid grid-cols-3 gap-2 w-48 h-32 md:hidden">
         <div />
         <button 
            className="bg-slate-700 active:bg-slate-600 rounded-xl flex items-center justify-center shadow-lg active:scale-95" 
            onTouchStart={(e) => { e.preventDefault(); move('UP'); }}
         >
            <ChevronUp size={32}/>
         </button>
         <div />
         
         <button 
            className="bg-slate-700 active:bg-slate-600 rounded-xl flex items-center justify-center shadow-lg active:scale-95" 
            onTouchStart={(e) => { e.preventDefault(); move('LEFT'); }}
         >
            <ChevronLeft size={32}/>
         </button>
         <button 
            className="bg-slate-700 active:bg-slate-600 rounded-xl flex items-center justify-center shadow-lg active:scale-95" 
            onTouchStart={(e) => { e.preventDefault(); move('DOWN'); }}
         >
            <ChevronDown size={32}/>
         </button>
         <button 
            className="bg-slate-700 active:bg-slate-600 rounded-xl flex items-center justify-center shadow-lg active:scale-95" 
            onTouchStart={(e) => { e.preventDefault(); move('RIGHT'); }}
         >
            <ChevronRight size={32}/>
         </button>
      </div>

      <div className="hidden md:block mt-8 text-slate-500 text-sm">
          Use Arrow Keys to move tiles
      </div>
    </div>
  );
};

export default Puzzle2048Game;