import React from 'react';
import { User, Bell, Search, MoreHorizontal } from 'lucide-react';
import { ColorData } from '../types';
import { getBestContrastColor } from '../utils/colorUtils';

interface UIPreviewProps {
  palette: ColorData[];
}

export const UIPreview: React.FC<UIPreviewProps> = ({ palette }) => {
  if (palette.length < 3) return null;

  // Assign roles based on palette position for simulation
  const primary = palette[Math.floor(palette.length / 2)];
  const background = palette[0];
  const surface = palette[1];
  const accent = palette[palette.length - 1];

  const primaryText = getBestContrastColor(primary.hex);
  const bgText = getBestContrastColor(background.hex);
  const surfaceText = getBestContrastColor(surface.hex);

  // We need to make sure the "surface" isn't too similar to background visually for the card effect
  // But for this generator, direct mapping is honest representation.

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 overflow-hidden">
        <h3 className="text-lg font-bold text-slate-800 mb-4">UI Implementation Preview</h3>
        
        <div 
            className="rounded-xl p-6 border border-black/5 shadow-inner transition-colors duration-500 flex flex-col gap-6"
            style={{ backgroundColor: background.hex }}
        >
            {/* Fake Navbar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: primary.hex, color: primaryText }}>
                        <div className="font-bold">C</div>
                    </div>
                    <span className="font-bold text-sm" style={{ color: bgText }}>Chroma</span>
                </div>
                <div className="flex gap-3">
                    <Search size={18} style={{ color: bgText }} opacity={0.6} />
                    <Bell size={18} style={{ color: bgText }} opacity={0.6} />
                </div>
            </div>

            {/* Hero Card */}
            <div 
                className="rounded-xl p-5 shadow-lg flex flex-col gap-4 transform transition-transform hover:scale-[1.01]"
                style={{ backgroundColor: surface.hex }}
            >
                <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: accent.hex, color: getBestContrastColor(accent.hex) }}>
                        <User size={20} />
                    </div>
                    <MoreHorizontal size={20} style={{ color: surfaceText }} opacity={0.5} />
                </div>
                
                <div style={{ color: surfaceText }}>
                    <h4 className="text-lg font-bold leading-tight">Project Alpha</h4>
                    <p className="text-xs opacity-70 mt-1">Due in 3 days</p>
                </div>

                <div className="mt-2">
                    <div className="w-full h-2 rounded-full overflow-hidden bg-black/10">
                        <div className="h-full rounded-full w-2/3 transition-all duration-1000" style={{ backgroundColor: primary.hex }}></div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs font-medium" style={{ color: surfaceText }}>
                        <span>Progress</span>
                        <span>68%</span>
                    </div>
                </div>

                <div className="flex gap-2 mt-1">
                    <button 
                        className="flex-1 py-2 rounded-lg text-sm font-semibold shadow-md transition-transform active:scale-95"
                        style={{ backgroundColor: primary.hex, color: primaryText }}
                    >
                        View Details
                    </button>
                     <button 
                        className="px-3 py-2 rounded-lg text-sm font-semibold border border-black/10"
                        style={{ backgroundColor: 'transparent', color: surfaceText }}
                    >
                        Skip
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};