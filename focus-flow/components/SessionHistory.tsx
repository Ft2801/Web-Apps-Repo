import React from 'react';
import { Session, ThemeColors, TimerMode } from '../types';
import { CheckCircle2 } from 'lucide-react';

interface SessionHistoryProps {
  sessions: Session[];
  theme: ThemeColors;
  clearHistory: () => void;
}

const SessionHistory: React.FC<SessionHistoryProps> = ({ sessions, theme, clearHistory }) => {
  const completedFocusSessions = sessions.filter(s => s.mode === TimerMode.FOCUS).length;
  const totalMinutes = sessions.reduce((acc, curr) => acc + curr.durationMinutes, 0);

  if (sessions.length === 0) return null;

  return (
    <div className="flex flex-col items-center mt-12 w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className={`flex items-center gap-2 mb-4 ${theme.text}`}>
        <CheckCircle2 size={16} />
        <span className="text-sm font-medium">Completed today</span>
      </div>
      
      <div className="flex gap-4 mb-6">
        <div className="bg-white/40 p-4 rounded-2xl flex flex-col items-center min-w-[100px] backdrop-blur-sm">
          <span className={`text-2xl font-semibold ${theme.text}`}>{completedFocusSessions}</span>
          <span className={`text-xs uppercase tracking-wide ${theme.subtext}`}>Sessions</span>
        </div>
        <div className="bg-white/40 p-4 rounded-2xl flex flex-col items-center min-w-[100px] backdrop-blur-sm">
          <span className={`text-2xl font-semibold ${theme.text}`}>{totalMinutes}</span>
          <span className={`text-xs uppercase tracking-wide ${theme.subtext}`}>Minutes</span>
        </div>
      </div>

      <button 
        onClick={clearHistory}
        className={`text-xs underline opacity-50 hover:opacity-100 transition-opacity ${theme.subtext}`}
      >
        Clear History
      </button>
    </div>
  );
};

export default SessionHistory;
