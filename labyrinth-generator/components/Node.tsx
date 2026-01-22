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
    prevProps.width === nextProps.width
  );
});