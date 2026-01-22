import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { ColorData } from '../types';
import { getContrastRatio } from '../utils/colorUtils';

interface ContrastCheckerProps {
  palette: ColorData[];
}

export const ContrastChecker: React.FC<ContrastCheckerProps> = ({ palette }) => {
  // Store actual hex values instead of indices to allow custom colors
  const [bgHex, setBgHex] = useState<string>('#FFFFFF');
  const [textHex, setTextHex] = useState<string>('#000000');

  // Initialize with palette values when palette loads or changes
  useEffect(() => {
    if (palette.length > 0) {
      setBgHex(palette[0].hex);
      // Default text color to the one with highest contrast against background, or just the last one
      // Using the last one (usually contrast/dark/light) is a safe default for the generator logic
      setTextHex(palette[palette.length - 1].hex);
    }
  }, [palette]);

  const contrast = getContrastRatio(bgHex, textHex);

  const ScoreBadge = ({ pass, label }: { pass: boolean; label: string }) => (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${pass ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
        {pass ? <CheckCircle size={16} /> : <XCircle size={16} />}
        <span className="text-sm font-semibold">{label}</span>
    </div>
  );

  const ColorSelector = ({ label, value, onChange }: { label: string, value: string, onChange: (c: string) => void }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
        <span className="text-xs font-mono text-slate-400">{value}</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {/* Palette Swatches */}
        {palette.map((c, i) => (
          <button
            key={i}
            onClick={() => onChange(c.hex)}
            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${value === c.hex ? 'border-slate-900 scale-110' : 'border-transparent'}`}
            style={{ backgroundColor: c.hex }}
            title={`Palette color ${i+1}`}
          />
        ))}
        
        {/* Divider */}
        <div className="w-px h-8 bg-slate-200 mx-1"></div>

        {/* Black & White Presets */}
        <button
          onClick={() => onChange('#000000')}
          className={`w-8 h-8 rounded-full bg-black border-2 transition-transform hover:scale-110 ${value === '#000000' ? 'border-slate-400 scale-110' : 'border-transparent'}`}
          title="Black"
        />
        <button
          onClick={() => onChange('#FFFFFF')}
          className={`w-8 h-8 rounded-full bg-white border-2 border-slate-200 transition-transform hover:scale-110 ${value === '#FFFFFF' ? 'border-slate-900 scale-110' : 'border-slate-200'}`}
          title="White"
        />

        {/* Custom Picker */}
        <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-slate-200 cursor-pointer hover:border-slate-400 transition-colors bg-slate-50 flex items-center justify-center">
            {/* Rainbow gradient to indicate custom picker */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-400 via-green-400 to-blue-400 opacity-50"></div>
            <input 
                type="color" 
                value={value}
                onChange={(e) => onChange(e.target.value.toUpperCase())}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 border-0 cursor-pointer opacity-0"
            />
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <h3 className="text-lg font-bold text-slate-800 mb-4">Accessibility Checker</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Visual Preview */}
        <div 
          className="rounded-xl p-8 flex flex-col justify-center items-center text-center shadow-inner transition-colors duration-300 min-h-[160px] border border-slate-100"
          style={{ backgroundColor: bgHex }}
        >
          <p className="text-2xl font-bold mb-2 transition-colors duration-300" style={{ color: textHex }}>
            Large Text
          </p>
          <p className="text-base transition-colors duration-300" style={{ color: textHex }}>
            The quick brown fox jumps over the lazy dog.
          </p>
        </div>

        {/* Controls & Scores */}
        <div className="flex flex-col justify-between gap-6">
            <div className="space-y-4">
                 <ColorSelector label="Background Color" value={bgHex} onChange={setBgHex} />
                 <ColorSelector label="Text Color" value={textHex} onChange={setTextHex} />

                <div className="flex items-baseline gap-2 mt-4 pt-4 border-t border-slate-100">
                    <span className="text-4xl font-black text-slate-800">{contrast.ratio}</span>
                    <span className="text-slate-500 font-medium">Contrast Ratio</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <ScoreBadge pass={contrast.aaLarge} label="AA Large" />
                <ScoreBadge pass={contrast.aaaLarge} label="AAA Large" />
                <ScoreBadge pass={contrast.aa} label="AA Normal" />
                <ScoreBadge pass={contrast.aaa} label="AAA Normal" />
            </div>
        </div>
      </div>
    </div>
  );
};