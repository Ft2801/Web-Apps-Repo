import React from 'react';
import { PaletteHistoryItem } from '../types';
import { Clock, Trash2, RotateCcw } from 'lucide-react';

interface HistoryPanelProps {
  history: PaletteHistoryItem[];
  onSelect: (item: PaletteHistoryItem) => void;
  onClear: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onSelect, onClear, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-transparent" onClick={onClose}></div>
      <div className="absolute right-0 top-14 z-50 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                <Clock size={16} /> Recent Palettes
            </h3>
            {history.length > 0 && (
                <button onClick={onClear} className="text-red-500 hover:text-red-600 transition-colors p-1" title="Clear History">
                    <Trash2 size={16} />
                </button>
            )}
        </div>
        
        <div className="max-h-[300px] overflow-y-auto">
            {history.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">No palettes generated yet.</div>
            ) : (
                <ul className="divide-y divide-slate-50">
                    {history.map((item) => (
                        <li key={item.id}>
                            <button 
                                onClick={() => { onSelect(item); onClose(); }}
                                className="w-full p-3 hover:bg-slate-50 transition-colors flex items-center gap-3 text-left group"
                            >
                                <div className="flex -space-x-1 shrink-0">
                                    {item.colors.slice(0, 4).map((c, i) => (
                                        <div key={i} className="w-4 h-4 rounded-full ring-1 ring-white" style={{ backgroundColor: c.hex }} />
                                    ))}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-slate-900 truncate uppercase">{item.baseColor}</p>
                                    <p className="text-[10px] text-slate-500 capitalize">{item.mode}</p>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 text-blue-500">
                                    <RotateCcw size={14} />
                                </div>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
      </div>
    </>
  );
};