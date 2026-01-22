import React, { useState, useEffect, useRef, useCallback } from 'react';
import Node from './components/Node';
import Controls from './components/Controls';
import { AlgorithmType, GridType, NodeType, VisualizationStats } from './types';
import { dijkstra, aStar, getNodesInShortestPathOrder } from './services/algorithms';
import { generateMaze as generateKruskalMaze } from './services/maze';

// Default constants
const INITIAL_COLS = 41; // Odd numbers work better for maze generation
const INITIAL_ROWS = 17;
const DEFAULT_SPEED = 20;

const App: React.FC = () => {
  // --- State ---
  const [grid, setGrid] = useState<GridType>([]);
  const [cols, setCols] = useState(INITIAL_COLS);
  const [rows, setRows] = useState(INITIAL_ROWS);
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [algorithm, setAlgorithm] = useState<AlgorithmType>(AlgorithmType.DIJKSTRA);
  const [speed, setSpeed] = useState(DEFAULT_SPEED);
  const [stats, setStats] = useState<VisualizationStats | null>(null);

  // Dragging State
  const draggingNodeRef = useRef<'start' | 'finish' | null>(null);

  // Refs for node positions
  const startNodePos = useRef({ row: Math.floor(INITIAL_ROWS / 2), col: Math.floor(INITIAL_COLS / 4) });
  const finishNodePos = useRef({ row: Math.floor(INITIAL_ROWS / 2), col: Math.floor(INITIAL_COLS * 0.75) });
  
  // Timeout references
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  // --- Helpers ---
  
  const createNode = useCallback((col: number, row: number, startPos: {r: number, c: number}, finishPos: {r: number, c: number}): NodeType => {
    return {
      col,
      row,
      isStart: row === startPos.r && col === startPos.c,
      isFinish: row === finishPos.r && col === finishPos.c,
      distance: Infinity,
      isVisited: false,
      isWall: false,
      previousNode: null,
      totalDistance: Infinity,
      heuristicDistance: Infinity,
    };
  }, []);

  const getInitialGrid = useCallback((rowCount: number, colCount: number, startPos: {r: number, c: number}, finishPos: {r: number, c: number}): GridType => {
    const newGrid: GridType = [];
    for (let row = 0; row < rowCount; row++) {
      const currentRow: NodeType[] = [];
      for (let col = 0; col < colCount; col++) {
        currentRow.push(createNode(col, row, startPos, finishPos));
      }
      newGrid.push(currentRow);
    }
    return newGrid;
  }, [createNode]);

  // Clear existing CSS animations
  const clearDOMAnimations = useCallback(() => {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const node = document.getElementById(`node-${r}-${c}`);
        if (node) {
          node.classList.remove('node-visited', 'node-path');
        }
      }
    }
  }, [rows, cols]);

  // --- Effects ---

  // 1. Initial Setup (Mobile Detection)
  useEffect(() => {
    if (window.innerWidth < 640) {
      setCols(21);
      setRows(15);
    }
  }, []);

  // 2. Handle Grid Dimensions Change or Reset
  // This effect resets the grid, clears animations, and recalculates positions
  useEffect(() => {
    // Stop any running visualization
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
    setIsVisualizing(false);
    setStats(null);
    clearDOMAnimations();

    // Recalculate Start/End relative positions for new dimensions
    startNodePos.current = { row: Math.floor(rows / 2), col: Math.floor(cols / 4) };
    finishNodePos.current = { row: Math.floor(rows / 2), col: Math.floor(cols * 0.75) };

    const grid = getInitialGrid(
        rows, 
        cols, 
        { r: startNodePos.current.row, c: startNodePos.current.col }, 
        { r: finishNodePos.current.row, c: finishNodePos.current.col }
    );
    setGrid(grid);
  }, [rows, cols, getInitialGrid, clearDOMAnimations]);

  // 3. Global Mouse Up
  useEffect(() => {
    const handleGlobalMouseUp = () => {
        draggingNodeRef.current = null;
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
        window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);


  // --- Grid Interactions ---

  const handleMouseDown = (row: number, col: number) => {
    if (isVisualizing) return;
    const node = grid[row][col];
    if (node.isStart) draggingNodeRef.current = 'start';
    else if (node.isFinish) draggingNodeRef.current = 'finish';
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (!draggingNodeRef.current || isVisualizing) return;

    if (draggingNodeRef.current === 'start') {
      setGrid(prev => moveStartNode(prev, row, col));
    } else if (draggingNodeRef.current === 'finish') {
      setGrid(prev => moveFinishNode(prev, row, col));
    }
  };

  const moveStartNode = (prevGrid: GridType, row: number, col: number) => {
    if (row < 0 || row >= rows || col < 0 || col >= cols) return prevGrid;
    if (prevGrid[row][col].isFinish) return prevGrid;

    const newGrid = [...prevGrid];
    const prevRow = startNodePos.current.row;
    const prevCol = startNodePos.current.col;
    
    if (newGrid[prevRow] === prevGrid[prevRow]) newGrid[prevRow] = [...prevGrid[prevRow]];
    newGrid[prevRow][prevCol] = { ...newGrid[prevRow][prevCol], isStart: false };
    
    if (row !== prevRow && newGrid[row] === prevGrid[row]) newGrid[row] = [...prevGrid[row]];
    newGrid[row][col] = { ...newGrid[row][col], isStart: true, isWall: false };
    
    startNodePos.current = { row, col };
    return newGrid;
  };

  const moveFinishNode = (prevGrid: GridType, row: number, col: number) => {
    if (row < 0 || row >= rows || col < 0 || col >= cols) return prevGrid;
    if (prevGrid[row][col].isStart) return prevGrid;

    const newGrid = [...prevGrid];
    const prevRow = finishNodePos.current.row;
    const prevCol = finishNodePos.current.col;
    
    if (newGrid[prevRow] === prevGrid[prevRow]) newGrid[prevRow] = [...prevGrid[prevRow]];
    newGrid[prevRow][prevCol] = { ...newGrid[prevRow][prevCol], isFinish: false };

    if (row !== prevRow && newGrid[row] === prevGrid[row]) newGrid[row] = [...prevGrid[row]];
    newGrid[row][col] = { ...newGrid[row][col], isFinish: true, isWall: false };

    finishNodePos.current = { row, col };
    return newGrid;
  };

  // --- Visualization Actions ---

  const clearPath = () => {
    if (isVisualizing) return;
    clearDOMAnimations();
    setGrid(prev => prev.map(row => 
        row.map(node => ({
            ...node,
            distance: Infinity,
            isVisited: false,
            previousNode: null,
            totalDistance: Infinity,
            heuristicDistance: Infinity
        }))
    ));
    setStats(null);
  };

  const resetGrid = () => {
      if (isVisualizing) return;
      clearDOMAnimations();
      // This will trigger the useEffect because we aren't changing rows/cols, 
      // but we need to reset the grid structure. 
      // Actually, since we want to reset to initial state, we can just re-call getInitialGrid
      const grid = getInitialGrid(
        rows, 
        cols, 
        { r: Math.floor(rows / 2), c: Math.floor(cols / 4) }, 
        { r: Math.floor(rows / 2), c: Math.floor(cols * 0.75) }
      );
      // Update refs to match the reset positions
      startNodePos.current = { row: Math.floor(rows / 2), col: Math.floor(cols / 4) };
      finishNodePos.current = { row: Math.floor(rows / 2), col: Math.floor(cols * 0.75) };
      setGrid(grid);
      setStats(null);
  };

  const runMazeGeneration = () => {
      if (isVisualizing) return;
      clearDOMAnimations();
      setStats(null);
      
      const newGrid = generateKruskalMaze(
          grid, 
          grid[startNodePos.current.row][startNodePos.current.col],
          grid[finishNodePos.current.row][finishNodePos.current.col]
      );
      setGrid(newGrid);
  }

  const animateAlgorithms = (visitedNodesInOrder: NodeType[], nodesInShortestPathOrder: NodeType[]) => {
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        const timerId = setTimeout(() => {
          animateShortestPath(nodesInShortestPathOrder);
        }, speed * i);
        timeouts.current.push(timerId);
        return;
      }

      const timerId = setTimeout(() => {
        const node = visitedNodesInOrder[i];
        if (!node.isStart && !node.isFinish) {
            document.getElementById(`node-${node.row}-${node.col}`)?.classList.add('node-visited');
        }
      }, speed * i);
      timeouts.current.push(timerId);
    }
  };

  const animateShortestPath = (nodesInShortestPathOrder: NodeType[]) => {
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      const timerId = setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        if (!node.isStart && !node.isFinish) {
             document.getElementById(`node-${node.row}-${node.col}`)?.classList.add('node-path');
        }
        if (i === nodesInShortestPathOrder.length - 1) setIsVisualizing(false);
      }, 40 * i);
      timeouts.current.push(timerId);
    }
    if (nodesInShortestPathOrder.length === 0) setIsVisualizing(false);
  };

  const visualize = () => {
    if (isVisualizing) return;
    
    clearDOMAnimations();
    
    const cleanGrid = grid.map(row => 
        row.map(node => ({
            ...node,
            distance: Infinity,
            isVisited: false,
            previousNode: null,
            totalDistance: Infinity,
            heuristicDistance: Infinity
        }))
    );
    
    setGrid(cleanGrid); 
    setIsVisualizing(true);
    
    setTimeout(() => {
        const startNode = cleanGrid[startNodePos.current.row][startNodePos.current.col];
        const finishNode = cleanGrid[finishNodePos.current.row][finishNodePos.current.col];
        let visitedNodesInOrder: NodeType[] = [];
        
        const startTime = performance.now();
        if (algorithm === AlgorithmType.DIJKSTRA) visitedNodesInOrder = dijkstra(cleanGrid, startNode, finishNode);
        else visitedNodesInOrder = aStar(cleanGrid, startNode, finishNode);
        
        const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
        const endTime = performance.now();

        setStats({
            visitedCount: visitedNodesInOrder.length,
            pathLength: nodesInShortestPathOrder.length,
            executionTime: endTime - startTime
        });

        animateAlgorithms(visitedNodesInOrder, nodesInShortestPathOrder);
    }, 10);
  };

  useEffect(() => {
      return () => {
          timeouts.current.forEach(clearTimeout);
      };
  }, []);

  // Dynamic Node Sizing
  const [nodeWidth, setNodeWidth] = useState(20);
  
  useEffect(() => {
      const handleResize = () => {
          const w = window.innerWidth;
          // Add padding compensation
          const availableWidth = w - 32; 
          const calculated = Math.floor(availableWidth / cols);
          setNodeWidth(Math.min(Math.max(calculated, 8), 35));
      };
      
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
  }, [cols]);

  return (
    <div className="flex flex-col h-screen bg-[#020617] text-white">
      <Controls
        algorithm={algorithm}
        setAlgorithm={setAlgorithm}
        visualize={visualize}
        resetGrid={resetGrid}
        clearPath={clearPath}
        generateMaze={runMazeGeneration}
        isVisualizing={isVisualizing}
        speed={speed}
        setSpeed={setSpeed}
        rows={rows}
        cols={cols}
        setDimensions={(r, c) => {
            const oddR = r % 2 === 0 ? r + 1 : r;
            const oddC = c % 2 === 0 ? c + 1 : c;
            setRows(oddR);
            setCols(oddC);
        }}
        stats={stats}
      />
      
      <div className="flex-1 flex items-center justify-center overflow-auto p-2 md:p-4 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 to-[#020617]">
         <div className="bg-slate-900 shadow-2xl border-4 border-slate-800 rounded-lg p-1">
            <div 
                className="grid gap-[1px] bg-slate-800"
                style={{ 
                    gridTemplateColumns: `repeat(${cols}, ${nodeWidth}px)`,
                    width: 'fit-content'
                }}
            >
                {grid.map((row, rowIdx) =>
                    row.map((node, colIdx) => (
                        <Node
                            key={`${rowIdx}-${colIdx}`}
                            col={node.col}
                            row={node.row}
                            isStart={node.isStart}
                            isFinish={node.isFinish}
                            isWall={node.isWall}
                            onMouseDown={handleMouseDown}
                            onMouseEnter={handleMouseEnter}
                            onMouseUp={() => { draggingNodeRef.current = null; }}
                            width={nodeWidth}
                        />
                    ))
                )}
            </div>
         </div>
      </div>
      
      <div className="text-center text-[10px] text-slate-600 pb-2 hidden md:block">
          NeonPath Lab v1.0 • Drag Start/End to move • Dijkstra & A* Visualization
      </div>
    </div>
  );
};

export default App;