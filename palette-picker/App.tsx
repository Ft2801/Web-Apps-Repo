import React, { useState, useEffect } from 'react';
import { ColorData, HarmonyMode } from './types';
import { generatePalette, hexToRgb } from './utils/colorUtils';
import { ColorBlock } from './components/ColorBlock';
import { ContrastChecker } from './components/ContrastChecker';
import { UIPreview } from './components/UIPreview';
import { Palette, RefreshCw, Hash, Sliders } from 'lucide-react';

const MODES: { value: HarmonyMode; label: string }[] = [
  { value: 'monochromatic', label: 'Monochromatic' },
  { value: 'analogous', label: 'Analogous' },
  { value: 'complementary', label: 'Complementary' },
  { value: 'triadic', label: 'Triadic' },
  { value: 'split-complementary', label: 'Split Comp' },
];

function App() {
  const [baseColor, setBaseColor] = useState<string>('#3B82F6');
  const [mode, setMode] = useState<HarmonyMode>('monochromatic');
  const [palette, setPalette] = useState<ColorData[]>([]);

  // Effect to update palette when user changes inputs
  useEffect(() => {
    if (hexToRgb(baseColor)) {
      setPalette(generatePalette(baseColor, mode));
    }
  }, [baseColor, mode]);

  // Handle Manual Color Change
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBaseColor(e.target.value.toUpperCase());
  };

  const handleRandomize = () => {
    const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    setBaseColor(randomColor.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600">
            <Palette size={24} strokeWidth={2.5} />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">ChromaFlow</h1>
          </div>
          {/* History feature removed */}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        
        {/* Controls Section */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
            
            {/* Top Row: Color & Modes */}
            <div className="flex flex-col lg:flex-row gap-8 items-start justify-between">
                
                {/* Color Input */}
                <div className="flex flex-col gap-3 w-full lg:w-auto">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                        <Sliders size={14} /> Base Color
                    </label>
                    <div className="flex items-center gap-3">
                        <div className="relative w-14 h-14 rounded-full overflow-hidden shadow-inner ring-2 ring-slate-100 bg-white">
                            <input 
                                type="color" 
                                value={baseColor}
                                onChange={handleColorChange}
                                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 border-0 cursor-pointer"
                            />
                        </div>
                        <div className="relative">
                            <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text"
                                value={baseColor}
                                onChange={handleColorChange}
                                maxLength={7}
                                className="pl-9 pr-4 py-2 w-32 rounded-lg border border-slate-300 bg-white text-slate-900 font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
                            />
                        </div>
                         <button 
                            onClick={handleRandomize}
                            className="p-2.5 rounded-lg border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all bg-white"
                            title="Randomize"
                         >
                            <RefreshCw size={18} />
                         </button>
                    </div>
                </div>

                {/* Harmony Selector */}
                <div className="flex flex-col gap-3 w-full lg:w-auto flex-1">
                     <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Harmony</label>
                     <div className="flex flex-wrap gap-2">
                        {MODES.map((m) => (
                            <button
                                key={m.value}
                                onClick={() => setMode(m.value)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                    mode === m.value 
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {m.label}
                            </button>
                        ))}
                     </div>
                </div>
            </div>
        </section>

        {/* Palette Display */}
        {/* Optimized for mobile: removed fixed height, allowed natural stacking with flex-col */}
        <section className="rounded-3xl overflow-hidden shadow-xl flex flex-col md:flex-row md:h-[400px]">
            {palette.map((color, idx) => (
                <ColorBlock key={`${color.hex}-${idx}`} color={color} index={idx} />
            ))}
        </section>

        {/* Info Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ContrastChecker palette={palette} />
            <UIPreview palette={palette} />
        </section>

      </main>
    </div>
  );
}

export default App;