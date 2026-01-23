import React, { memo } from 'react';

interface NodeProps {
  col: number;
  row: number;
  isStart: boolean;
  isFinish: boolean;
  isWall: boolean;
  onMouseDown: (row: number, col: number) => void;
  onMouseEnter: (row: number, col: number) => void;
  onMouseUp: () => void;
  onTouchStart?: (row: number, col: number) => void;
  width: number; // width in pixels
}

const Node: React.FC<NodeProps> = ({
  col,
  row,
  isStart,
  isFinish,
  isWall,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
  onTouchStart,
  width,
}) => {
  const extraClassName = isFinish
    ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] z-10 scale-110 cursor-grab active:cursor-grabbing'
    : isStart
      ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.8)] z-10 scale-110 cursor-grab active:cursor-grabbing'
      : isWall
        ? 'node-wall' // Using the CSS animation class for walls
        : 'bg-transparent hover:bg-slate-800';

  return (
    <div
      id={`node-${row}-${col}`}
      className={`relative border border-slate-800 transition-colors select-none ${extraClassName}`}
      style={{ width: `${width}px`, height: `${width}px` }}
      onMouseDown={(e) => {
        // Prevent default dragging of the element itself, allowing our custom logic to take over
        e.preventDefault();
        onMouseDown(row, col);
      }}
      onTouchStart={(e) => {
        // Prevent default to stop scrolling
        if (e.cancelable) e.preventDefault();
        if (onTouchStart) onTouchStart(row, col);
      }}
      onMouseEnter={() => {
        onMouseEnter(row, col);
      }}
      onMouseUp={() => onMouseUp()}
    >
      {isStart && (
        <div className="w-full h-full flex items-center justify-center text-[10px] text-black font-bold pointer-events-none">S</div>
      )}
      {isFinish && (
        <div className="w-full h-full flex items-center justify-center text-[10px] text-black font-bold pointer-events-none">E</div>
      )}
    </div>
  );
};

export default memo(Node, (prevProps, nextProps) => {
  return (
    prevProps.isStart === nextProps.isStart &&
    prevProps.isFinish === nextProps.isFinish &&
    prevProps.isWall === nextProps.isWall &&
    prevProps.width === nextProps.width &&
    // Important: We assume onMouseDown/Enter/Up are stable references (useCallback in parent)
    // If they aren't, this memo will still work but might miss updates if handlers change.
    // Given App.tsx implementation, they are stable for the duration of visualization.
    prevProps.col === nextProps.col &&
    prevProps.row === nextProps.row
  );
});