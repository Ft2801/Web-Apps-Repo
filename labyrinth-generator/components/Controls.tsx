import React from 'react';
import { Play, RotateCcw, Grid3X3, Shuffle, Settings2, Zap } from 'lucide-react';
import { AlgorithmType, VisualizationStats } from '../types';

interface ControlsProps {
  algorithm: AlgorithmType;
  setAlgorithm: (algo: AlgorithmType) => void;
  visualize: () => void;
  resetGrid: () => void;
  clearPath: () => void;
  generateMaze: () => void;
  isVisualizing: boolean;
  speed: number;
  setSpeed: (speed: number) => void;
  rows: number;
  cols: number;
  setDimensions: (r: number, c: number) => void;
  stats: VisualizationStats | null;
}

const Controls: React.FC<ControlsProps> = ({
  algorithm,
  setAlgorithm,
  visualize,
  resetGrid,
  clearPath,
  generateMaze,
  isVisualizing,
  speed,
  setSpeed,
  rows,
  cols,
  setDimensions,
  stats
}) => {
  return (
    <div className="w-full bg-slate-900 border-b border-slate-800 p-3 md:p-4 flex flex-col gap-3 md:gap-4 shadow-lg z-20 shrink-0">
      
      {/* Top Row: Main Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        
        <div className="flex items-center gap-3 md:gap-4">
          <div className="flex items-center gap-1.5 md:gap-2">
            <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full shadow-[0_0_8px_#22c55e]"></div>
            <span className="text-[10px] md:text-xs text-slate-400 font-bold tracking-wider">START</span>
          </div>
           <div className="flex items-center gap-1.5 md:gap-2">
            <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-red-500 rounded-full shadow-[0_0_8px_#ef4444]"></div>
            <span className="text-[10px] md:text-xs text-slate-400 font-bold tracking-wider">END</span>
          </div>
        </div>

        <h1 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-tighter hidden sm:block">
          NEON<span className="font-thin text-white">PATH</span>
        </h1>

        <div className="flex items-center gap-2 ml-auto sm:ml-0">
           {stats && (
               <div className="hidden lg:flex mr-4 text-xs font-mono text-cyan-400 flex-col items-end border-r border-slate-700 pr-4">
                   <span>VISITED: {stats.visitedCount}</span>
                   <span>PATH: {stats.pathLength}</span>
                   <span>TIME: {stats.executionTime.toFixed(1)}ms</span>
               </div>
           )}
           <button
            onClick={visualize}
            disabled={isVisualizing}
            className={`flex items-center gap-2 px-4 py-1.5 md:px-6 md:py-2 rounded font-bold transition-all text-xs md:text-sm
              ${isVisualizing 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(8,145,178,0.5)] active:scale-95'
              }`}
          >
            {isVisualizing ? <Settings2 className="animate-spin w-3 h-3 md:w-4 md:h-4"/> : <Play className="w-3 h-3 md:w-4 md:h-4" />}
            VISUALIZE
          </button>
        </div>
      </div>

      {/* Bottom Row: Settings */}
      <div className="flex flex-wrap items-center justify-between gap-y-3 gap-x-2 md:gap-x-6 text-sm text-slate-300">
        
        {/* Algorithms */}
        <div className="flex items-center gap-1 md:gap-2 bg-slate-800/50 p-1 rounded-lg border border-slate-700 overflow-x-auto max-w-[150px] md:max-w-none">
          <button
            onClick={() => setAlgorithm(AlgorithmType.DIJKSTRA)}
            className={`px-2 py-1 md:px-3 rounded transition-colors text-[10px] md:text-sm whitespace-nowrap ${algorithm === AlgorithmType.DIJKSTRA ? 'bg-slate-700 text-cyan-400 shadow-sm' : 'hover:text-white'}`}
          >
            Dijkstra
          </button>
          <button
            onClick={() => setAlgorithm(AlgorithmType.A_STAR)}
            className={`px-2 py-1 md:px-3 rounded transition-colors text-[10px] md:text-sm whitespace-nowrap ${algorithm === AlgorithmType.A_STAR ? 'bg-slate-700 text-cyan-400 shadow-sm' : 'hover:text-white'}`}
          >
            A* Search
          </button>
        </div>

        {/* Maze & Reset */}
        <div className="flex items-center gap-1 md:gap-2">
            <button onClick={generateMaze} disabled={isVisualizing} className="p-1.5 md:p-2 hover:bg-slate-800 rounded border border-slate-700/50 hover:border-cyan-500/50 transition-colors" title="Generate Random Maze">
                <Shuffle className="w-3 h-3 md:w-4 md:h-4 text-purple-400" />
            </button>
            <button onClick={clearPath} disabled={isVisualizing} className="p-1.5 md:p-2 hover:bg-slate-800 rounded border border-slate-700/50 hover:border-yellow-500/50 transition-colors" title="Clear Path Only">
                <Zap className="w-3 h-3 md:w-4 md:h-4 text-yellow-400" />
            </button>
             <button onClick={resetGrid} disabled={isVisualizing} className="p-1.5 md:p-2 hover:bg-slate-800 rounded border border-slate-700/50 hover:border-red-500/50 transition-colors" title="Reset Entire Grid">
                <RotateCcw className="w-3 h-3 md:w-4 md:h-4 text-red-400" />
            </button>
        </div>

        {/* Sliders - Hidden on very small screens if needed, or condensed */}
        <div className="flex items-center gap-3 md:gap-6 ml-auto">
            <div className="flex flex-col gap-1 w-20 md:w-auto">
                <label className="text-[9px] md:text-[10px] uppercase font-bold text-slate-500">Speed</label>
                <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    step="10" 
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    disabled={isVisualizing}
                    className="h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
            </div>
            
            <div className="flex flex-col gap-1">
                <label className="text-[9px] md:text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1"><Grid3X3 className="w-3 h-3"/> Size</label>
                <select 
                    value={cols} 
                    onChange={(e) => {
                        const val = Number(e.target.value);
                        const r = Math.floor(val / 2.5); 
                        setDimensions(r, val);
                    }}
                    disabled={isVisualizing}
                    className="bg-slate-800 border-none text-[10px] md:text-xs rounded py-1 px-1 md:px-2 focus:ring-1 focus:ring-cyan-500 w-16 md:w-auto"
                >
                    <option value="20">Small</option>
                    <option value="41">Normal</option>
                    <option value="61">Large</option>
                    <option value="81">Ultra</option>
                </select>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Controls;