import React, { useState, useEffect, useRef, useCallback } from 'react';
import Button from './Button';
import { ArrowLeft, Play, RotateCcw, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Trophy } from 'lucide-react';

interface SnakeGameProps {
  onBack: () => void;
}

type Point = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const GRID_SIZE = 15;
const SPEED = 150;

const SnakeGame: React.FC<SnakeGameProps> = ({ onBack }) => {
  const [snake, setSnake] = useState<Point[]>([{ x: 7, y: 7 }]);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  // Use ref for direction to avoid closure staleness in interval
  const directionRef = useRef<Direction>('RIGHT');
  const gameLoopRef = useRef<number | null>(null);

  const generateFood = useCallback((currentSnake: Point[]): Point => {
    while (true) {
      const x = Math.floor(Math.random() * GRID_SIZE);
      const y = Math.floor(Math.random() * GRID_SIZE);
      const collision = currentSnake.some(segment => segment.x === x && segment.y === y);
      if (!collision) return { x, y };
    }
  }, []);

  const startGame = () => {
    setSnake([{ x: 7, y: 7 }, { x: 6, y: 7 }, { x: 5, y: 7 }]);
    setFood(generateFood([{ x: 7, y: 7 }, { x: 6, y: 7 }, { x: 5, y: 7 }]));
    setDirection('RIGHT');
    directionRef.current = 'RIGHT';
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
  };

  const endGame = () => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    setIsPlaying(false);
    setGameOver(true);
    if (score > highScore) setHighScore(score);
  };

  const changeDirection = (newDir: Direction) => {
    const currentDir = directionRef.current;
    // Prevent 180 degree turns
    if (newDir === 'UP' && currentDir === 'DOWN') return;
    if (newDir === 'DOWN' && currentDir === 'UP') return;
    if (newDir === 'LEFT' && currentDir === 'RIGHT') return;
    if (newDir === 'RIGHT' && currentDir === 'LEFT') return;
    
    directionRef.current = newDir;
    setDirection(newDir);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      switch(e.key) {
        case 'ArrowUp': changeDirection('UP'); break;
        case 'ArrowDown': changeDirection('DOWN'); break;
        case 'ArrowLeft': changeDirection('LEFT'); break;
        case 'ArrowRight': changeDirection('RIGHT'); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  // Game Loop
  useEffect(() => {
    if (isPlaying) {
      gameLoopRef.current = window.setInterval(() => {
        setSnake(prevSnake => {
          const head = prevSnake[0];
          const newHead = { ...head };

          switch (directionRef.current) {
            case 'UP': newHead.y -= 1; break;
            case 'DOWN': newHead.y += 1; break;
            case 'LEFT': newHead.x -= 1; break;
            case 'RIGHT': newHead.x += 1; break;
          }

          // Check Wall Collision
          if (
            newHead.x < 0 || 
            newHead.x >= GRID_SIZE || 
            newHead.y < 0 || 
            newHead.y >= GRID_SIZE
          ) {
            endGame();
            return prevSnake;
          }

          // Check Self Collision
          if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
            endGame();
            return prevSnake;
          }

          const newSnake = [newHead, ...prevSnake];

          // Check Food
          if (newHead.x === food.x && newHead.y === food.y) {
            setScore(s => s + 1);
            setFood(generateFood(newSnake));
            // Don't pop tail (grow)
          } else {
            newSnake.pop(); // Remove tail
          }

          return newSnake;
        });
      }, SPEED);
    } else if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [isPlaying, food, generateFood]);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full max-w-md mx-auto p-4 animate-fade-in">
      <div className="w-full flex justify-between items-center mb-4">
         <Button variant="ghost" onClick={onBack} className="!px-3 !py-2">
            <ArrowLeft className="w-5 h-5" />
         </Button>
         <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
            Snake
         </h2>
         <div className="flex flex-col items-end">
             <div className="text-slate-200 font-mono font-bold text-lg">{score}</div>
             <div className="text-slate-500 text-xs flex items-center gap-1">
                 <Trophy size={10} /> {highScore}
             </div>
         </div>
      </div>

      {/* Game Board */}
      <div 
        className="bg-slate-800 border-4 border-slate-700 rounded-xl relative shadow-2xl overflow-hidden"
        style={{ 
            width: 'min(90vw, 350px)', 
            height: 'min(90vw, 350px)',
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`
        }}
      >
        {/* Overlay for Start/Game Over */}
        {(!isPlaying) && (
            <div className="absolute inset-0 z-20 bg-slate-900/80 flex flex-col items-center justify-center animate-fade-in backdrop-blur-sm">
                {gameOver ? (
                    <>
                        <h3 className="text-3xl font-bold text-red-500 mb-2">Game Over</h3>
                        <p className="text-slate-300 mb-6">Score: {score}</p>
                        <Button onClick={startGame} variant="primary">
                            <RotateCcw className="mr-2 w-5 h-5" /> Retry
                        </Button>
                    </>
                ) : (
                    <Button onClick={startGame} variant="primary" className="scale-125">
                        <Play className="mr-2 w-5 h-5" /> Start
                    </Button>
                )}
            </div>
        )}

        {/* Grid Cells - Not actually rendering 225 divs for performance, using absolute positioning for snake/food */}
        {/* Background Grid Lines (Optional, subtle) */}
        <div className="absolute inset-0 grid grid-cols-15 grid-rows-15 pointer-events-none opacity-10">
            {Array(GRID_SIZE * GRID_SIZE).fill(0).map((_, i) => (
                <div key={i} className="border-[0.5px] border-slate-500" />
            ))}
        </div>

        {/* Food */}
        <div 
            className="absolute bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse"
            style={{
                width: `${100/GRID_SIZE}%`,
                height: `${100/GRID_SIZE}%`,
                left: `${(food.x / GRID_SIZE) * 100}%`,
                top: `${(food.y / GRID_SIZE) * 100}%`,
                transform: 'scale(0.8)'
            }}
        />

        {/* Snake */}
        {snake.map((segment, i) => (
            <div 
                key={`${segment.x}-${segment.y}-${i}`}
                className={`absolute ${i === 0 ? 'bg-green-400 z-10' : 'bg-green-600'} rounded-sm transition-all duration-75`}
                style={{
                    width: `${100/GRID_SIZE}%`,
                    height: `${100/GRID_SIZE}%`,
                    left: `${(segment.x / GRID_SIZE) * 100}%`,
                    top: `${(segment.y / GRID_SIZE) * 100}%`,
                    border: '1px solid rgba(0,0,0,0.2)'
                }}
            >
                {/* Eyes for head */}
                {i === 0 && (
                    <div className="relative w-full h-full">
                        <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-black rounded-full opacity-50"></div>
                         <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-black rounded-full opacity-50"></div>
                    </div>
                )}
            </div>
        ))}
      </div>

      {/* D-Pad Controls */}
      <div className="mt-8 grid grid-cols-3 gap-2 w-48 h-32">
         <div />
         <button 
            className="bg-slate-700 active:bg-slate-600 rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            onPointerDown={(e) => { e.preventDefault(); changeDirection('UP'); }}
         >
             <ChevronUp size={32} />
         </button>
         <div />
         
         <button 
            className="bg-slate-700 active:bg-slate-600 rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            onPointerDown={(e) => { e.preventDefault(); changeDirection('LEFT'); }}
         >
             <ChevronLeft size={32} />
         </button>
         <button 
            className="bg-slate-700 active:bg-slate-600 rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            onPointerDown={(e) => { e.preventDefault(); changeDirection('DOWN'); }}
         >
             <ChevronDown size={32} />
         </button>
         <button 
            className="bg-slate-700 active:bg-slate-600 rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            onPointerDown={(e) => { e.preventDefault(); changeDirection('RIGHT'); }}
         >
             <ChevronRight size={32} />
         </button>
      </div>
    </div>
  );
};

export default SnakeGame;