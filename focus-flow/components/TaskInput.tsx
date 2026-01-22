import React from 'react';
import { ThemeColors } from '../types';

interface TaskInputProps {
  task: string;
  setTask: (task: string) => void;
  theme: ThemeColors;
}

const TaskInput: React.FC<TaskInputProps> = ({ task, setTask, theme }) => {
  return (
    <div className="w-full max-w-sm flex flex-col items-center gap-2">
      <label htmlFor="task" className={`text-xs font-medium uppercase tracking-widest ${theme.subtext}`}>
        Current Focus
      </label>
      <input
        id="task"
        type="text"
        value={task}
        onChange={(e) => setTask(e.target.value)}
        placeholder="What are you working on?"
        className={`
          w-full text-center bg-transparent border-b-2 border-transparent 
          focus:border-current outline-none text-xl py-2 px-4
          placeholder:text-gray-400/50 transition-colors duration-300
          ${theme.text}
        `}
      />
    </div>
  );
};

export default TaskInput;
