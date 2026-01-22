import React, { useState, useEffect, useCallback } from 'react';
import { Player, Difficulty, checkTrisWinner, getTrisBestMove } from '../utils/gameUtils';
import Button from './Button';
import { X, Circle, RefreshCw, ArrowLeft } from 'lucide-react';

interface TicTacToeProps {
  difficulty: Difficulty;
  playerSide: Player;
  onBack: () => void;
}

const TicTacToeGame: React.FC<TicTacToeProps> = ({ difficulty, playerSide, onBack }) => {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(playerSide === 'X'); // X always goes first
  const [winner, setWinner] = useState<Player | 'DRAW' | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  const computerSide = playerSide === 'X' ? 'O' : 'X';

  const handleCellClick = (index: number) => {
    if (board[index] || winner || isThinking || !isPlayerTurn) return;

    const newBoard = [...board];
    newBoard[index] = playerSide;
    setBoard(newBoard);
    setIsPlayerTurn(false);
  };

  const computerMove = useCallback(() => {
    if (winner || isPlayerTurn) return;

    setIsThinking(true);
    setTimeout(() => {
      const bestMoveIndex = getTrisBestMove([...board], difficulty, computerSide);
      if (bestMoveIndex !== -1) {
        setBoard((prev) => {
          const next = [...prev];
          next[bestMoveIndex] = computerSide;
          return next;
        });
        setIsPlayerTurn(true);
      }
      setIsThinking(false);
    }, 600);
  }, [board, difficulty, isPlayerTurn, winner, computerSide]);

  useEffect(() => {
    const result = checkTrisWinner(board);
    if (result) {
      setWinner(result);
    } else if (!isPlayerTurn) {
      computerMove();
    }
  }, [board, isPlayerTurn, computerMove]);

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(playerSide === 'X');
    setWinner(null);
    setIsThinking(false);
  };

  const getStatusMessage = () => {
    if (winner === playerSide) return "You Won! 🎉";
    if (winner === computerSide) return "Computer Wins 🤖";
    if (winner === 'DRAW') return "Draw 🤝";
    if (isThinking) return "Computer is thinking...";
    return isPlayerTurn ? `Your Turn (${playerSide})` : "Opponent's Turn";
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full max-w-md mx-auto p-4 animate-fade-in">
      <div className="w-full flex justify-between items-center mb-8">
         <Button variant="ghost" onClick={onBack} className="!px-3 !py-2">
            <ArrowLeft className="w-5 h-5" />
         </Button>
         <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Tic Tac Toe <span className="text-sm font-medium text-slate-400 ml-2">({difficulty === 'EASY' ? 'Easy' : 'Hard'})</span>
         </h2>
         <div className="w-10"></div>
      </div>

      <div className="mb-6 text-xl font-medium text-slate-200 h-8">
        {getStatusMessage()}
      </div>

      {/* Grid container with strict rows and aspect ratio */}
      <div className="grid grid-cols-3 grid-rows-3 gap-3 p-3 bg-slate-800 rounded-2xl shadow-2xl w-full aspect-square">
        {board.map((cell, idx) => (
          <button
            key={idx}
            onClick={() => handleCellClick(idx)}
            disabled={!!cell || !!winner || !isPlayerTurn}
            className={`
              h-full w-full rounded-xl flex items-center justify-center cell-shadow
              transition-all duration-300 relative overflow-hidden
              ${!cell && !winner && isPlayerTurn ? 'cursor-pointer hover:bg-slate-700/50' : ''}
              ${!cell ? 'bg-slate-800' : 'bg-slate-700/50'}
            `}
          >
            <div 
                className={`
                    absolute inset-0 flex items-center justify-center
                    transition-all duration-500 ease-elastic
                    ${cell ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}
                `}
            >
                {cell === 'X' && <X size={48} strokeWidth={2.5} className="text-blue-400" />}
                {cell === 'O' && <Circle size={40} strokeWidth={3} className="text-red-400" />}
            </div>

            {!cell && (
                <div className="absolute inset-0 m-auto w-2 h-2 bg-slate-700 rounded-full opacity-50" />
            )}
          </button>
        ))}
      </div>

      {winner && (
        <div className="mt-8 w-full animate-bounce-in">
          <Button onClick={resetGame} fullWidth variant="primary">
            <RefreshCw className="mr-2 w-5 h-5" />
            Play Again
          </Button>
        </div>
      )}
    </div>
  );
};

export default TicTacToeGame;