import React, { useState, useEffect, useRef, useCallback } from 'react';
import Node from './components/Node';
import Controls from './components/Controls';
import { AlgorithmType, GridType, NodeType, VisualizationStats } from './types';
import { dijkstra, aStar, getNodesInShortestPathOrder } from './services/algorithms';
import { generateMaze as generateKruskalMaze } from './services/maze';

// Default constants
const INITIAL_COLS = 31; // Slightly smaller default for better mobile fit
const INITIAL_ROWS = 15;
const DEFAULT_SPEED = 10;

const App: React.FC = () => {
  // --- State ---
  const [grid, setGrid] = useState<GridType>([]);
  const [cols, setCols] = useState(INITIAL_COLS);
  const [rows, setRows] = useState(INITIAL_ROWS);
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [algorithm, setAlgorithm] = useState<AlgorithmType>(AlgorithmType.DIJKSTRA);
  const [speed, setSpeed] = useState(DEFAULT_SPEED);
  const [stats, setStats] = useState<VisualizationStats | null>(null);
  const [nodeWidth, setNodeWidth] = useState(25);

  // Dragging State
  const draggingNodeRef = useRef<'start' | 'finish' | null>(null);
  const isMouseDownRef = useRef(false);

  // Refs for node positions
  const startNodePos = useRef({ row: Math.floor(INITIAL_ROWS / 2), col: Math.floor(INITIAL_COLS / 4) });
  const finishNodePos = useRef({ row: Math.floor(INITIAL_ROWS / 2), col: Math.floor(INITIAL_COLS * 0.75) });

  // Timeout references
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
  const controlsRef = useRef<HTMLDivElement>(null);

  // --- Helpers ---

  const createNode = useCallback((col: number, row: number, startPos: { r: number, c: number }, finishPos: { r: number, c: number }): NodeType => {
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

  const getInitialGrid = useCallback((rowCount: number, colCount: number, startPos: { r: number, c: number }, finishPos: { r: number, c: number }): GridType => {
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

  // 1. Initial Setup and Responsive Sizing
  useEffect(() => {
    const handleResize = () => {
      if (!controlsRef.current) return;

      const controlsHeight = controlsRef.current.offsetHeight;
      const availableHeight = window.innerHeight - controlsHeight - 60; // 60px combined vertical margin (top+bottom)
      const availableWidth = window.innerWidth - 40; // 40px combined horizontal margin

      // Calculate max node size that fits in BOTH dimensions
      const sizeByHeight = Math.floor(availableHeight / rows);
      const sizeByWidth = Math.floor(availableWidth / cols);

      // Ensure strictly minimal size (e.g. 5px) to never overflow, capping at 35px maximum
      const newSize = Math.min(Math.max(Math.min(sizeByHeight, sizeByWidth), 10), 40);

      setNodeWidth(newSize);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [rows, cols]);

  // 2. Handle Grid Dimensions Change or Reset
  useEffect(() => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
    setIsVisualizing(false);
    setStats(null);
    clearDOMAnimations();

    // Clamp start/finish positions to new bounds
    const clamp = (val: number, max: number) => Math.min(Math.max(val, 0), max - 1);

    startNodePos.current = {
      row: clamp(startNodePos.current.row, rows),
      col: clamp(startNodePos.current.col, cols)
    };
    finishNodePos.current = {
      row: clamp(finishNodePos.current.row, rows),
      col: clamp(finishNodePos.current.col, cols)
    };

    // Ensure start != finish
    if (startNodePos.current.row === finishNodePos.current.row && startNodePos.current.col === finishNodePos.current.col) {
      finishNodePos.current.col = (finishNodePos.current.col + 1) % cols;
    }

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
      isMouseDownRef.current = false;
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);


  // --- Grid Interactions ---

  const handleMouseDown = useCallback((row: number, col: number) => {
    if (isVisualizing) return;
    isMouseDownRef.current = true;

    // We use a function update to access current grid without dependency
    setGrid(currentGrid => {
      const node = currentGrid[row][col];
      if (node.isStart) {
        draggingNodeRef.current = 'start';
        return currentGrid;
      }
      else if (node.isFinish) {
        draggingNodeRef.current = 'finish';
        return currentGrid;
      }
      else {
        // Toggle Wall immediately if not dragging start/end
        const newGrid = currentGrid.map(r => [...r]); // Shallow copy rows
        // Toggle logic
        const isWall = !newGrid[row][col].isWall;
        newGrid[row][col] = { ...newGrid[row][col], isWall };
        return newGrid;
      }
    });
  }, [isVisualizing]);

  const handleMouseEnter = useCallback((row: number, col: number) => {
    if (isVisualizing || !isMouseDownRef.current) return;

    setGrid(prevGrid => {
      // Helper to find actual position in grid to avoid ref desync
      const findNodePos = (type: 'start' | 'finish'): { r: number, c: number } | null => {
        // Optimization: check Ref guess first
        const refPos = type === 'start' ? startNodePos.current : finishNodePos.current;
        if (prevGrid[refPos.row] && prevGrid[refPos.row][refPos.col]) {
          const node = prevGrid[refPos.row][refPos.col];
          if ((type === 'start' && node.isStart) || (type === 'finish' && node.isFinish)) {
            return { r: refPos.row, c: refPos.col };
          }
        }
        // Fallback: search grid
        for (let r = 0; r < prevGrid.length; r++) {
          for (let c = 0; c < prevGrid[0].length; c++) {
            const node = prevGrid[r][c];
            if ((type === 'start' && node.isStart) || (type === 'finish' && node.isFinish)) {
              return { r, c };
            }
          }
        }
        return null;
      };

      // If dragging Start
      if (draggingNodeRef.current === 'start') {
        const currentPos = findNodePos('start');
        if (!currentPos) return prevGrid;

        const prevRow = currentPos.r;
        const prevCol = currentPos.c;
        if (row === prevRow && col === prevCol) return prevGrid; // No change
        if (prevGrid[row][col].isFinish) return prevGrid; // Cannot overlap finish

        const newGrid = [...prevGrid];
        if (newGrid[prevRow] === prevGrid[prevRow]) newGrid[prevRow] = [...prevGrid[prevRow]];
        if (newGrid[row] === prevGrid[row]) newGrid[row] = [...prevGrid[row]];

        newGrid[prevRow][prevCol] = { ...newGrid[prevRow][prevCol], isStart: false };
        newGrid[row][col] = { ...newGrid[row][col], isStart: true, isWall: false };

        startNodePos.current = { row, col };
        return newGrid;
      }
      // If dragging Finish
      else if (draggingNodeRef.current === 'finish') {
        const currentPos = findNodePos('finish');
        if (!currentPos) return prevGrid;

        const prevRow = currentPos.r;
        const prevCol = currentPos.c;
        if (row === prevRow && col === prevCol) return prevGrid;
        if (prevGrid[row][col].isStart) return prevGrid;

        const newGrid = [...prevGrid];
        if (newGrid[prevRow] === prevGrid[prevRow]) newGrid[prevRow] = [...prevGrid[prevRow]];
        if (newGrid[row] === prevGrid[row]) newGrid[row] = [...prevGrid[row]];

        newGrid[prevRow][prevCol] = { ...newGrid[prevRow][prevCol], isFinish: false };
        newGrid[row][col] = { ...newGrid[row][col], isFinish: true, isWall: false };

        finishNodePos.current = { row, col };
        return newGrid;
      }
      // If drawing Walls
      else if (!draggingNodeRef.current) {
        const node = prevGrid[row][col];
        if (node.isStart || node.isFinish) return prevGrid;

        // To prevent flipping back and forth, you typically want to set it to 'isWall' state determined on MouseDown
        // For simplicity in this demo, we just set to true (draw wall)
        if (node.isWall) return prevGrid;

        const newGrid = [...prevGrid];
        if (newGrid[row] === prevGrid[row]) newGrid[row] = [...prevGrid[row]];
        newGrid[row][col] = { ...newGrid[row][col], isWall: true };
        return newGrid;
      }
      return prevGrid;
    });
  }, [isVisualizing]);

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

    startNodePos.current = { row: Math.floor(rows / 2), col: Math.floor(cols / 4) };
    finishNodePos.current = { row: Math.floor(rows / 2), col: Math.floor(cols * 0.75) };

    const grid = getInitialGrid(
      rows,
      cols,
      { r: startNodePos.current.row, c: startNodePos.current.col },
      { r: finishNodePos.current.row, c: finishNodePos.current.col }
    );
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
      }, speed * 2 * i);
      timeouts.current.push(timerId);
    }
    if (nodesInShortestPathOrder.length === 0) setIsVisualizing(false);
  };

  const visualize = () => {
    if (isVisualizing) return;

    clearDOMAnimations();

    // Create a clean copy for algorithm run
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

    // Optimistically update grid to clear old path in state
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


  return (
    <div className="flex flex-col h-screen bg-[#020617] text-white overflow-hidden">
      <div ref={controlsRef}>
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
            setRows(r);
            setCols(c);
          }}
          stats={stats}
        />
      </div>

      {/* 
         Main Content Area:
         - Using Flex + Center to position grid
         - No overflow-auto on valid configurations, but safeguards present
         - Padding ensures the 20px margin requirement
       */}
      <div className="flex-1 flex items-center justify-center p-5 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 to-[#020617] overflow-hidden">
        <div
          className="bg-slate-900 shadow-2xl border-4 border-slate-800 rounded-lg p-1 transition-all duration-300 ease-in-out"
          style={{
            width: 'fit-content',
            height: 'fit-content'
          }}
        >
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
                  onMouseUp={() => { draggingNodeRef.current = null; isMouseDownRef.current = false; }}
                  width={nodeWidth}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;