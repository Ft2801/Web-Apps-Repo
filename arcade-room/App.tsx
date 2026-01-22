import React, { useState } from 'react';
import { Difficulty, Player, C4Player } from './utils/gameUtils';
import TicTacToeGame from './components/TicTacToeGame';
import Connect4Game from './components/Connect4Game';
import MemoryGame from './components/MemoryGame';
import RockPaperScissorsGame from './components/RockPaperScissorsGame';
import SimonGame from './components/SimonGame';
import WhackAMoleGame from './components/WhackAMoleGame';
import MinesweeperGame from './components/MinesweeperGame';
import ReactionGame from './components/ReactionGame';
import SnakeGame from './components/SnakeGame';
import Puzzle2048Game from './components/Puzzle2048Game';
import Button from './components/Button';
import { Grid3X3, ArrowDownCircle, Brain, Scissors, Zap, MousePointer2, Bomb, Timer, Gamepad2, Grid2X2 } from 'lucide-react';

type View = 'MENU' | 'TICTACTOE_SETUP' | 'CONNECT4_SETUP' | 'RPS_SETUP' | 
            'TICTACTOE_GAME' | 'CONNECT4_GAME' | 'MEMORY_GAME' | 'RPS_GAME' | 'SIMON_GAME' | 
            'WHACK_GAME' | 'MINESWEEPER_GAME' | 'REACTION_GAME' | 'SNAKE_GAME' | 'PUZZLE2048_GAME';

function App() {
  const [currentView, setCurrentView] = useState<View>('MENU');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('EASY');
  const [trisSide, setTrisSide] = useState<Player>('X');
  const [c4Side, setC4Side] = useState<C4Player>('RED');

  // Step 2 for setup: Side selection
  const [setupStep, setSetupStep] = useState<1 | 2>(1); 

  const startTris = (side: Player) => {
      setTrisSide(side);
      setCurrentView('TICTACTOE_GAME');
      setSetupStep(1);
  }

  const startC4 = (side: C4Player) => {
      setC4Side(side);
      setCurrentView('CONNECT4_GAME');
      setSetupStep(1);
  }

  const renderMenu = () => (
    <div className="flex flex-col items-center min-h-screen w-full max-w-md mx-auto p-6 animate-fade-in pb-20">
      <div className="text-center space-y-2 mt-8 mb-8">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-400 to-red-400 bg-clip-text text-transparent pb-2">
          Arcade
        </h1>
        <p className="text-slate-400">Choose a game to start</p>
      </div>

      <div className="grid grid-cols-1 gap-4 w-full">
        {/* Tris Card */}
        <button 
          onClick={() => setCurrentView('TICTACTOE_SETUP')}
          className="group relative bg-slate-800 p-5 rounded-2xl border border-slate-700 hover:border-blue-500 transition-all duration-300 shadow-xl hover:shadow-blue-500/20 text-left flex items-center justify-between"
        >
          <div>
             <h2 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">Tic Tac Toe</h2>
             <p className="text-slate-400 text-xs">The classic 3-in-a-row.</p>
          </div>
          <div className="bg-slate-700 p-3 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Grid3X3 className="w-6 h-6" />
          </div>
        </button>

        {/* Connect 4 Card */}
        <button 
          onClick={() => setCurrentView('CONNECT4_SETUP')}
          className="group relative bg-slate-800 p-5 rounded-2xl border border-slate-700 hover:border-yellow-500 transition-all duration-300 shadow-xl hover:shadow-yellow-500/20 text-left flex items-center justify-between"
        >
           <div>
             <h2 className="text-xl font-bold text-white mb-1 group-hover:text-yellow-400 transition-colors">Connect 4</h2>
             <p className="text-slate-400 text-xs">Connect 4 to win.</p>
          </div>
          <div className="bg-slate-700 p-3 rounded-full group-hover:bg-yellow-500 group-hover:text-white transition-colors">
            <ArrowDownCircle className="w-6 h-6" />
          </div>
        </button>

         {/* Memory Card */}
         <button 
          onClick={() => setCurrentView('MEMORY_GAME')}
          className="group relative bg-slate-800 p-5 rounded-2xl border border-slate-700 hover:border-pink-500 transition-all duration-300 shadow-xl hover:shadow-pink-500/20 text-left flex items-center justify-between"
        >
           <div>
             <h2 className="text-xl font-bold text-white mb-1 group-hover:text-pink-400 transition-colors">Memory</h2>
             <p className="text-slate-400 text-xs">Find matching pairs.</p>
          </div>
          <div className="bg-slate-700 p-3 rounded-full group-hover:bg-pink-500 group-hover:text-white transition-colors">
            <Brain className="w-6 h-6" />
          </div>
        </button>

        {/* Rock Paper Scissors Card */}
        <button 
          onClick={() => setCurrentView('RPS_GAME')}
          className="group relative bg-slate-800 p-5 rounded-2xl border border-slate-700 hover:border-orange-500 transition-all duration-300 shadow-xl hover:shadow-orange-500/20 text-left flex items-center justify-between"
        >
           <div>
             <h2 className="text-xl font-bold text-white mb-1 group-hover:text-orange-400 transition-colors">Rock Paper Scissors</h2>
             <p className="text-slate-400 text-xs">Beat the AI.</p>
          </div>
          <div className="bg-slate-700 p-3 rounded-full group-hover:bg-orange-500 group-hover:text-white transition-colors">
            <Scissors className="w-6 h-6" />
          </div>
        </button>

        {/* Snake Card */}
        <button 
          onClick={() => setCurrentView('SNAKE_GAME')}
          className="group relative bg-slate-800 p-5 rounded-2xl border border-slate-700 hover:border-emerald-500 transition-all duration-300 shadow-xl hover:shadow-emerald-500/20 text-left flex items-center justify-between"
        >
           <div>
             <h2 className="text-xl font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">Snake</h2>
             <p className="text-slate-400 text-xs">Eat and grow.</p>
          </div>
          <div className="bg-slate-700 p-3 rounded-full group-hover:bg-emerald-500 group-hover:text-white transition-colors">
            <Gamepad2 className="w-6 h-6" />
          </div>
        </button>

        {/* 2048 Card */}
        <button 
          onClick={() => setCurrentView('PUZZLE2048_GAME')}
          className="group relative bg-slate-800 p-5 rounded-2xl border border-slate-700 hover:border-violet-500 transition-all duration-300 shadow-xl hover:shadow-violet-500/20 text-left flex items-center justify-between"
        >
           <div>
             <h2 className="text-xl font-bold text-white mb-1 group-hover:text-violet-400 transition-colors">2048</h2>
             <p className="text-slate-400 text-xs">Merge the tiles.</p>
          </div>
          <div className="bg-slate-700 p-3 rounded-full group-hover:bg-violet-500 group-hover:text-white transition-colors">
            <Grid2X2 className="w-6 h-6" />
          </div>
        </button>

        {/* Simon Says Card */}
        <button 
          onClick={() => setCurrentView('SIMON_GAME')}
          className="group relative bg-slate-800 p-5 rounded-2xl border border-slate-700 hover:border-green-500 transition-all duration-300 shadow-xl hover:shadow-green-500/20 text-left flex items-center justify-between"
        >
           <div>
             <h2 className="text-xl font-bold text-white mb-1 group-hover:text-green-400 transition-colors">Simon Says</h2>
             <p className="text-slate-400 text-xs">Follow the sequence.</p>
          </div>
          <div className="bg-slate-700 p-3 rounded-full group-hover:bg-green-500 group-hover:text-white transition-colors">
            <Zap className="w-6 h-6" />
          </div>
        </button>

        {/* Whack-a-Light Card */}
        <button 
          onClick={() => setCurrentView('WHACK_GAME')}
          className="group relative bg-slate-800 p-5 rounded-2xl border border-slate-700 hover:border-cyan-500 transition-all duration-300 shadow-xl hover:shadow-cyan-500/20 text-left flex items-center justify-between"
        >
           <div>
             <h2 className="text-xl font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">Whack-a-Light</h2>
             <p className="text-slate-400 text-xs">Test your reflexes.</p>
          </div>
          <div className="bg-slate-700 p-3 rounded-full group-hover:bg-cyan-500 group-hover:text-white transition-colors">
            <MousePointer2 className="w-6 h-6" />
          </div>
        </button>

        {/* Minefield Card */}
        <button 
          onClick={() => setCurrentView('MINESWEEPER_GAME')}
          className="group relative bg-slate-800 p-5 rounded-2xl border border-slate-700 hover:border-red-500 transition-all duration-300 shadow-xl hover:shadow-red-500/20 text-left flex items-center justify-between"
        >
           <div>
             <h2 className="text-xl font-bold text-white mb-1 group-hover:text-red-400 transition-colors">Minefield</h2>
             <p className="text-slate-400 text-xs">Avoid the bombs.</p>
          </div>
          <div className="bg-slate-700 p-3 rounded-full group-hover:bg-red-500 group-hover:text-white transition-colors">
            <Bomb className="w-6 h-6" />
          </div>
        </button>

         {/* Reaction Card */}
         <button 
          onClick={() => setCurrentView('REACTION_GAME')}
          className="group relative bg-slate-800 p-5 rounded-2xl border border-slate-700 hover:border-indigo-500 transition-all duration-300 shadow-xl hover:shadow-indigo-500/20 text-left flex items-center justify-between"
        >
           <div>
             <h2 className="text-xl font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">Reflex</h2>
             <p className="text-slate-400 text-xs">Test your speed.</p>
          </div>
          <div className="bg-slate-700 p-3 rounded-full group-hover:bg-indigo-500 group-hover:text-white transition-colors">
            <Timer className="w-6 h-6" />
          </div>
        </button>
      </div>
    </div>
  );

  const renderSetup = (game: 'TRIS' | 'C4') => (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 max-w-md mx-auto space-y-8 animate-fade-in">
        <div className="text-center w-full">
            <h2 className="text-3xl font-bold text-white mb-2">
                {setupStep === 1 ? 'Difficulty' : 'Choose Side'}
            </h2>
            <p className="text-slate-400 mb-8">
                {setupStep === 1 ? 'How good are you?' : 'Who do you want to be?'}
            </p>

            <div className="space-y-4 w-full">
                {setupStep === 1 && (
                    <>
                        <Button fullWidth variant="secondary" className="!py-4 text-lg border-2 border-transparent focus:border-green-500"
                            onClick={() => { 
                                setSelectedDifficulty('EASY'); 
                                setSetupStep(2); 
                            }}>
                            <span className="text-green-400 mr-2">●</span> Easy
                        </Button>

                        {game === 'C4' && (
                            <Button fullWidth variant="secondary" className="!py-4 text-lg border-2 border-transparent focus:border-yellow-500"
                                onClick={() => { setSelectedDifficulty('MEDIUM'); setSetupStep(2); }}>
                                <span className="text-yellow-400 mr-2">●</span> Medium
                            </Button>
                        )}

                        <Button fullWidth variant="secondary" className="!py-4 text-lg border-2 border-transparent focus:border-red-500"
                            onClick={() => { 
                                setSelectedDifficulty('HARD'); 
                                setSetupStep(2); 
                            }}>
                            <span className="text-red-500 mr-2">●</span> Hard
                        </Button>
                    </>
                )}

                {setupStep === 2 && game === 'TRIS' && (
                    <>
                         <Button fullWidth variant="secondary" className="!py-4 text-lg border-2 border-transparent focus:border-blue-500"
                            onClick={() => startTris('X')}>
                            <span className="text-blue-400 mr-2 font-bold text-2xl">X</span> (You Start)
                        </Button>
                        <Button fullWidth variant="secondary" className="!py-4 text-lg border-2 border-transparent focus:border-red-500"
                            onClick={() => startTris('O')}>
                            <span className="text-red-400 mr-2 font-bold text-2xl">O</span> (PC Starts)
                        </Button>
                    </>
                )}

                {setupStep === 2 && game === 'C4' && (
                    <>
                         <Button fullWidth variant="secondary" className="!py-4 text-lg border-2 border-transparent focus:border-red-500"
                            onClick={() => startC4('RED')}>
                            <div className="w-4 h-4 rounded-full bg-red-500 mr-3 inline-block"></div> Red (You Start)
                        </Button>
                        <Button fullWidth variant="secondary" className="!py-4 text-lg border-2 border-transparent focus:border-yellow-400"
                            onClick={() => startC4('YELLOW')}>
                            <div className="w-4 h-4 rounded-full bg-yellow-400 mr-3 inline-block"></div> Yellow (PC Starts)
                        </Button>
                    </>
                )}
            </div>

            <Button variant="ghost" className="mt-8" onClick={() => {
                if(setupStep === 2) setSetupStep(1);
                else setCurrentView('MENU');
            }}>
                {setupStep === 2 ? 'Back' : 'Cancel'}
            </Button>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-blue-500/30 overflow-y-auto">
        {currentView === 'MENU' && renderMenu()}
        {currentView === 'TICTACTOE_SETUP' && renderSetup('TRIS')}
        {currentView === 'CONNECT4_SETUP' && renderSetup('C4')}
        
        {currentView === 'TICTACTOE_GAME' && (
            <div className="h-screen flex flex-col">
                <TicTacToeGame 
                    difficulty={selectedDifficulty}
                    playerSide={trisSide}
                    onBack={() => setCurrentView('MENU')} 
                />
            </div>
        )}
        
        {currentView === 'CONNECT4_GAME' && (
            <div className="h-screen flex flex-col">
                <Connect4Game 
                    difficulty={selectedDifficulty}
                    playerSide={c4Side}
                    onBack={() => setCurrentView('MENU')} 
                />
            </div>
        )}

        {currentView === 'MEMORY_GAME' && (
            <div className="h-screen flex flex-col">
                <MemoryGame onBack={() => setCurrentView('MENU')} />
            </div>
        )}

        {currentView === 'RPS_GAME' && (
             <div className="h-screen flex flex-col">
                <RockPaperScissorsGame 
                    onBack={() => setCurrentView('MENU')} 
                />
            </div>
        )}

        {currentView === 'SIMON_GAME' && (
             <div className="h-screen flex flex-col">
                <SimonGame onBack={() => setCurrentView('MENU')} />
            </div>
        )}

        {currentView === 'WHACK_GAME' && (
             <div className="h-screen flex flex-col">
                <WhackAMoleGame onBack={() => setCurrentView('MENU')} />
            </div>
        )}

        {currentView === 'MINESWEEPER_GAME' && (
             <div className="h-screen flex flex-col">
                <MinesweeperGame onBack={() => setCurrentView('MENU')} />
            </div>
        )}

        {currentView === 'REACTION_GAME' && (
             <div className="h-screen flex flex-col">
                <ReactionGame onBack={() => setCurrentView('MENU')} />
            </div>
        )}

        {currentView === 'SNAKE_GAME' && (
             <div className="h-screen flex flex-col">
                <SnakeGame onBack={() => setCurrentView('MENU')} />
            </div>
        )}

        {currentView === 'PUZZLE2048_GAME' && (
             <div className="h-screen flex flex-col">
                <Puzzle2048Game onBack={() => setCurrentView('MENU')} />
            </div>
        )}
    </div>
  );
}

export default App;