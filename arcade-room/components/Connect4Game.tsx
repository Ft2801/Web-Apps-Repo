import React, { useState, useEffect, useCallback } from 'react';
import { C4Player, Difficulty, ROWS, COLS, createEmptyC4Board, checkC4Winner, getC4BestMove } from '../utils/gameUtils';
import Button from './Button';
import { ArrowLeft, RefreshCw } from 'lucide-react';

interface Connect4Props {
  difficulty: Difficulty;
  playerSide: C4Player;
  onBack: () => void;
}

const Connect4Game: React.FC<Connect4Props> = ({ difficulty, playerSide, onBack }) => {
  const [board, setBoard] = useState<C4Player[][]>(createEmptyC4Board());
  // Red always starts first. If player is Red, player starts. If player is Yellow, Computer (Red) starts.
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(playerSide === 'RED'); 
  const [winner, setWinner] = useState<C4Player | 'DRAW' | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  const computerSide = playerSide === 'RED' ? 'YELLOW' : 'RED';

  // Helper to find the lowest empty row in a column
  const getLowestEmptyRow = (currentBoard: C4Player[][], colIndex: number) => {
    for (let r = ROWS - 1; r >= 0; r--) {
      if (!currentBoard[r][colIndex]) return r;
    }
    return -1;
  };

  const handleColumnClick = (colIndex: number) => {
    if (winner || isThinking || !isPlayerTurn) return;

    const row = getLowestEmptyRow(board, colIndex);
    if (row === -1) return; // Column full

    const newBoard = board.map(r => [...r]);
    newBoard[row][colIndex] = playerSide;
    setBoard(newBoard);
    setIsPlayerTurn(false);
  };

  const computerMove = useCallback(() => {
    if (winner || isPlayerTurn) return;

    setIsThinking(true);
    setTimeout(() => {
        requestAnimationFrame(() => {
            const bestCol = getC4BestMove(board, difficulty, computerSide);
            
            if (bestCol !== -1) {
                const row = getLowestEmptyRow(board, bestCol);
                if (row !== -1) {
                    setBoard(prev => {
                        const newBoard = prev.map(r => [...r]);
                        newBoard[row][bestCol] = computerSide;
                        return newBoard;
                    });
                    setIsPlayerTurn(true);
                }
            }
            setIsThinking(false);
        })
    }, 500);
  }, [board, difficulty, isPlayerTurn, winner, computerSide]);

  useEffect(() => {
    const result = checkC4Winner(board);
    if (result) {
      setWinner(result);
    } else if (!isPlayerTurn) {
      computerMove();
    }
  }, [board, isPlayerTurn, computerMove]);

  const resetGame = () => {
    setBoard(createEmptyC4Board());
    setIsPlayerTurn(playerSide === 'RED');
    setWinner(null);
    setIsThinking(false);
  };

  const getStatusMessage = () => {
    if (winner === playerSide) return "You Won! 🎉";
    if (winner === computerSide) return "Computer Wins 🤖";
    if (winner === 'DRAW') return "Draw 🤝";
    if (isThinking) return "Computer is thinking...";
    return isPlayerTurn ? "Your Turn" : "Opponent's Turn";
  };

  const getDifficultyLabel = () => {
      switch(difficulty) {
          case 'EASY': return 'Easy';
          case 'MEDIUM': return 'Medium';
          case 'HARD': return 'Hard';
      }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full w-full max-w-md mx-auto p-2 animate-fade-in">
      <div className="w-full flex justify-between items-center mb-4">
         <Button variant="ghost" onClick={onBack} className="!px-3 !py-2">
            <ArrowLeft className="w-5 h-5" />
         </Button>
         <h2 className="text-xl font-bold bg-gradient-to-r from-red-400 to-yellow-400 bg-clip-text text-transparent">
            Connect 4 <span className="text-sm font-medium text-slate-400 ml-2">({getDifficultyLabel()})</span>
         </h2>
         <div className="w-10"></div>
      </div>

      <div className="mb-4 text-lg font-medium text-slate-200 h-6">
        {getStatusMessage()}
      </div>

      {/* Game Board */}
      <div className="bg-blue-700 p-3 pb-8 rounded-xl shadow-2xl w-full touch-none select-none relative">
        {/* Clickable Columns Overlay */}
        <div className="absolute inset-0 grid grid-cols-7 z-10 h-full w-full">
            {Array(COLS).fill(null).map((_, colIdx) => (
                <div 
                    key={`col-${colIdx}`}
                    onClick={() => handleColumnClick(colIdx)}
                    className="h-full w-full cursor-pointer hover:bg-white/5 transition-colors rounded-t-lg"
                />
            ))}
        </div>

        <div className="grid grid-rows-6 gap-2">
          {board.map((row, rIdx) => (
            <div key={rIdx} className="grid grid-cols-7 gap-2">
              {row.map((cell, cIdx) => (
                <div 
                  key={`${rIdx}-${cIdx}`} 
                  className="w-full aspect-square bg-slate-900 rounded-full shadow-[inset_2px_2px_6px_rgba(0,0,0,0.6)] flex items-center justify-center overflow-hidden relative"
                >
                    {/* The Piece */}
                    <div 
                        className={`
                            w-[90%] h-[90%] rounded-full shadow-inner transition-all duration-500 ease-bounce
                            ${cell === 'RED' ? 'bg-red-500 shadow-red-900 translate-y-0 opacity-100' : ''}
                            ${cell === 'YELLOW' ? 'bg-yellow-400 shadow-yellow-700 translate-y-0 opacity-100' : ''}
                            ${!cell ? '-translate-y-[400px] opacity-0' : ''}
                        `}
                    />
                </div>
              ))}
            </div>
          ))}
        </div>
        
        {/* Legs of the board */}
        <div className="absolute -bottom-4 left-4 w-4 h-8 bg-blue-800 rounded-b-lg"></div>
        <div className="absolute -bottom-4 right-4 w-4 h-8 bg-blue-800 rounded-b-lg"></div>
      </div>

      {winner && (
        <div className="mt-8 w-full animate-bounce-in z-20">
          <Button onClick={resetGame} fullWidth variant="primary">
            <RefreshCw className="mr-2 w-5 h-5" />
            Play Again
          </Button>
        </div>
      )}
    </div>
  );
};

export default Connect4Game;