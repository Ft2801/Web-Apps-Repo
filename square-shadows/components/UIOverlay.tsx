import React, { useState } from 'react';
import { SceneSettings } from '../App';

interface UIOverlayProps {
  settings: SceneSettings;
  onUpdate: (s: SceneSettings) => void;
  onReset: () => void;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({ settings, onUpdate, onReset }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (key: keyof SceneSettings, value: number) => {
    onUpdate({ ...settings, [key]: value });
  };

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-20">
      {/* Menu Toggle Button */}
      <div className="absolute top-6 right-6 pointer-events-auto">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-slate-800/80 hover:bg-slate-700/80 text-white p-3 rounded-full backdrop-blur-sm transition-all shadow-lg border border-slate-600/50"
          aria-label="Toggle Settings"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={`w-6 h-6 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`}
          >
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            )}
          </svg>
        </button>
      </div>

      {/* Settings Panel */}
      <div
        className={`absolute top-20 right-6 w-72 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-2xl p-6 pointer-events-auto shadow-2xl transition-all duration-300 origin-top-right transform ${
          isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <h2 className="text-white text-lg font-bold mb-4 border-b border-slate-700 pb-2">Settings</h2>
        
        <div className="space-y-5">
          {/* Movement Speed */}
          <div>
            <div className="flex justify-between text-slate-300 text-sm mb-1">
              <span>Movement Speed</span>
              <span className="font-mono text-slate-400">{settings.moveSpeed.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={settings.moveSpeed}
              onChange={(e) => handleChange('moveSpeed', parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400 hover:accent-amber-300"
            />
          </div>

          {/* Direction Angle */}
          <div>
            <div className="flex justify-between text-slate-300 text-sm mb-1">
              <span>Direction Angle</span>
              <span className="font-mono text-slate-400">{settings.directionAngle}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              step="1"
              value={settings.directionAngle}
              onChange={(e) => handleChange('directionAngle', parseInt(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-400 hover:accent-purple-300"
            />
          </div>

          {/* Rotation Speed */}
          <div>
            <div className="flex justify-between text-slate-300 text-sm mb-1">
              <span>Rotation Speed</span>
              <span className="font-mono text-slate-400">{settings.rotSpeed.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={settings.rotSpeed}
              onChange={(e) => handleChange('rotSpeed', parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400 hover:accent-emerald-300"
            />
          </div>

          {/* Square Count */}
          <div>
            <div className="flex justify-between text-slate-300 text-sm mb-1">
              <span>Square Count</span>
              <span className="font-mono text-slate-400">{settings.numSquares}</span>
            </div>
            <input
              type="range"
              min="10"
              max="80"
              step="1"
              value={settings.numSquares}
              onChange={(e) => handleChange('numSquares', parseInt(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-400 hover:accent-blue-300"
            />
          </div>

          {/* Shadow Intensity */}
          <div>
            <div className="flex justify-between text-slate-300 text-sm mb-1">
              <span>Shadow Intensity</span>
              <span className="font-mono text-slate-400">{Math.round(settings.shadowIntensity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.shadowIntensity}
              onChange={(e) => handleChange('shadowIntensity', parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-400 hover:accent-pink-300"
            />
          </div>

          {/* Reset Button */}
          <div className="pt-4 border-t border-slate-700 mt-2">
            <button
              onClick={onReset}
              className="w-full py-2 px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};