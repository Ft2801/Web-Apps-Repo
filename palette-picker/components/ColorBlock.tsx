import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { ColorData } from '../types';
import { getBestContrastColor } from '../utils/colorUtils';

interface ColorBlockProps {
  color: ColorData;
  index: number;
}

export const ColorBlock: React.FC<ColorBlockProps> = ({ color, index }) => {
  const [copied, setCopied] = useState<string | null>(null);

  const textColor = getBestContrastColor(color.hex);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div 
      className="group relative flex-1 min-h-[160px] md:min-h-[300px] flex flex-col justify-end p-4 transition-all duration-300 hover:flex-[1.5] md:hover:flex-[2]"
      style={{ backgroundColor: color.hex }}
    >
      {/* Base Badge */}
      {color.isBase && (
        <span className="absolute top-4 left-4 text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-black/20 backdrop-blur-sm border border-white/20" style={{ color: textColor }}>
          Base
        </span>
      )}

      {/* Content */}
      <div className="flex flex-col gap-2 opacity-90 transition-opacity">
        <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold font-mono" style={{ color: textColor }}>
            {color.hex}
            </h3>
            <button 
                onClick={() => handleCopy(color.hex, 'hex')}
                className="p-2 rounded-full hover:bg-white/20 transition-colors"
                style={{ color: textColor }}
                title="Copy HEX"
            >
                {copied === 'hex' ? <Check size={20} /> : <Copy size={20} />}
            </button>
        </div>

        {/* Details visible on hover or large screens */}
        <div className="flex flex-col gap-1 text-sm font-mono opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-75 transform translate-y-2 group-hover:translate-y-0">
          <div 
            className="flex items-center justify-between cursor-pointer hover:bg-white/10 p-1 rounded"
            onClick={() => handleCopy(color.rgb, 'rgb')}
            style={{ color: textColor }}
          >
             <span>{color.rgb}</span>
             {copied === 'rgb' && <Check size={14} />}
          </div>
          <div 
            className="flex items-center justify-between cursor-pointer hover:bg-white/10 p-1 rounded"
            onClick={() => handleCopy(`bg-[${color.hex}]`, 'tw')}
            style={{ color: textColor }}
          >
             <span>Tailwind: -[{color.hex}]</span>
             {copied === 'tw' && <Check size={14} />}
          </div>
        </div>
      </div>
    </div>
  );
};