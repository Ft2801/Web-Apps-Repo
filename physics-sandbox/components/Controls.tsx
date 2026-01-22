import React, { useState } from 'react';
import { ShapeType, PhysicsSettings, GeneratorSettings } from '../types';
import { 
  Circle, 
  Square, 
  Triangle, 
  Pentagon, 
  Trash2, 
  Maximize, 
  Minimize,
  RefreshCcw,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface ControlsProps {
  settings: PhysicsSettings;
  setSettings: React.Dispatch<React.SetStateAction<PhysicsSettings>>;
  generatorSettings: GeneratorSettings;
  setGeneratorSettings: React.Dispatch<React.SetStateAction<GeneratorSettings>>;
  selectedShape: ShapeType;
  setSelectedShape: (s: ShapeType) => void;
  onClear: () => void;
  onReset: () => void;
}

const Controls: React.FC<ControlsProps> = ({
  settings,
  setSettings,
  generatorSettings,
  setGeneratorSettings,
  selectedShape,
  setSelectedShape,
  onClear,
  onReset
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const handleSliderChange = (key: keyof PhysicsSettings, value: number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleGeneratorChange = (key: keyof GeneratorSettings, value: number) => {
    setGeneratorSettings(prev => ({ ...prev, [key]: value }));
  };

  const toggleWalls = () => {
    setSettings(prev => ({ ...prev, showWalls: !prev.showWalls }));
  };

  return (
    <div 
      className={`fixed z-20 transition-transform duration-300 ease-out
        /* === MOBILE PORTRAIT: Bottom Sheet === */
        bottom-0 inset-x-0
        flex flex-col items-center
        /* Closed: Translate down but leave 32px (h-8) visible */
        ${isExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-2rem)]'}

        /* === DESKTOP: Right Side Panel === */
        sm:inset-auto sm:top-4 sm:right-0 sm:flex-row sm:items-start
        
        /* CRITICAL FIX: Explicitly reset Y translation on desktop to prevent diagonal movement */
        sm:translate-y-0

        /* Closed: Translate right but leave 24px (w-6) visible */
        ${isExpanded ? 'sm:translate-x-0' : 'sm:translate-x-[calc(100%-1.5rem)]'}
      `}
    >
      
      {/* --- TOGGLE TAB --- */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          relative z-30 flex items-center justify-center
          bg-slate-900 border-cyan-500/50 text-cyan-400
          hover:bg-slate-800 transition-colors cursor-pointer
          
          /* Mobile Styles */
          w-32 h-8 
          rounded-t-lg border-t border-x border-b-0
          mb-[-1px] /* Overlap panel border */

          /* Desktop Styles */
          sm:w-6 sm:h-24 sm:mt-8
          sm:rounded-l-lg sm:rounded-r-none 
          sm:border-l sm:border-y sm:border-r-0
          sm:mb-0 sm:mr-[-1px] /* Overlap panel border */
        `}
      >
        <div className="sm:hidden flex">
          {isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </div>
        <div className="hidden sm:flex">
          {isExpanded ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </div>
      </button>

      {/* --- MAIN PANEL CONTENT --- */}
      <div className={`
        relative z-20 
        bg-slate-900/95 backdrop-blur-md border-cyan-500/50 shadow-2xl overflow-hidden
        
        /* Mobile Styles */
        w-full border-t
        max-h-[70vh] flex flex-col

        /* Desktop Styles */
        sm:w-80 sm:h-auto sm:max-h-[85vh] 
        sm:rounded-bl-xl sm:border-l sm:border-b sm:border-t-0
      `}>
        
        {/* Scrollable Area */}
        <div className="overflow-y-auto p-4 flex flex-col gap-4">
          
          {/* Generator Section */}
          <div className="bg-slate-800/50 border border-cyan-500/30 p-3 rounded-lg">
            <div className="flex gap-3 mb-3">
              <div className="grid grid-cols-2 gap-2 flex-1">
                {[ShapeType.CIRCLE, ShapeType.RECTANGLE, ShapeType.TRIANGLE, ShapeType.PENTAGON].map((shape) => (
                   <ShapeButton 
                    key={shape}
                    active={selectedShape === shape} 
                    onClick={() => setSelectedShape(shape)}
                    shape={shape}
                  />
                ))}
              </div>
              
              <div className="w-20 h-20 bg-slate-900 rounded border border-cyan-500/20 flex items-center justify-center overflow-hidden shrink-0 relative">
                 <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#06b6d4 1px, transparent 1px)', backgroundSize: '4px 4px' }}></div>
                 <ShapePreview shape={selectedShape} angle={generatorSettings.angle} />
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-cyan-500/20">
               <Slider 
                  label="Size" 
                  value={generatorSettings.size} 
                  min={10} max={100} step={1}
                  onChange={(v) => handleGeneratorChange('size', v)}
                />
                <Slider 
                  label="Rotation" 
                  value={generatorSettings.angle} 
                  min={0} max={360} step={5}
                  onChange={(v) => handleGeneratorChange('angle', v)}
                />
            </div>
          </div>

          {/* Physics Section */}
          <div className="bg-slate-800/50 border border-cyan-500/30 p-3 rounded-lg space-y-4">
             <Slider 
                label="Gravity" 
                value={settings.gravity} 
                min={0} max={2} step={0.1}
                onChange={(v) => handleSliderChange('gravity', v)} 
              />
              <Slider 
                label="Bounce" 
                value={settings.restitution} 
                min={0} max={1.0} step={0.1}
                onChange={(v) => handleSliderChange('restitution', v)} 
              />
              <div className="grid grid-cols-2 gap-3">
                <Slider 
                  label="Friction" 
                  value={settings.friction} 
                  min={0} max={1} step={0.05}
                  onChange={(v) => handleSliderChange('friction', v)} 
                />
                <Slider 
                  label="Air Res." 
                  value={settings.frictionAir} 
                  min={0} max={0.1} step={0.001}
                  onChange={(v) => handleSliderChange('frictionAir', v)} 
                />
              </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <ControlButton onClick={toggleWalls} active={settings.showWalls}>
              {settings.showWalls ? <Minimize size={16} /> : <Maximize size={16} />}
              <span className="hidden sm:inline">Walls</span>
            </ControlButton>
            <ControlButton onClick={onReset} variant="warning">
              <RefreshCcw size={16} />
              <span className="hidden sm:inline">Reset</span>
            </ControlButton>
            <ControlButton onClick={onClear} variant="danger">
              <Trash2 size={16} />
              <span className="hidden sm:inline">Clear</span>
            </ControlButton>
          </div>

        </div>
      </div>
    </div>
  );
};

// --- Subcomponents ---

const ShapeButton: React.FC<{ active: boolean; onClick: () => void; shape: ShapeType }> = ({ active, onClick, shape }) => {
  const icons = {
    [ShapeType.CIRCLE]: <Circle size={20} />,
    [ShapeType.RECTANGLE]: <Square size={20} />,
    [ShapeType.TRIANGLE]: <Triangle size={20} />,
    [ShapeType.PENTAGON]: <Pentagon size={20} />
  };

  return (
    <button
      onClick={onClick}
      className={`p-2 rounded flex items-center justify-center transition-all duration-200 border ${
        active 
          ? 'bg-cyan-500 text-slate-900 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)]' 
          : 'bg-slate-800 text-cyan-500/60 border-transparent hover:bg-slate-700 hover:text-cyan-400 hover:border-cyan-500/30'
      }`}
    >
      {icons[shape]}
    </button>
  );
};

const ControlButton: React.FC<{ 
  onClick: () => void; 
  children: React.ReactNode; 
  active?: boolean;
  variant?: 'default' | 'danger' | 'warning' 
}> = ({ onClick, children, active, variant = 'default' }) => {
  const base = "py-2 px-1 rounded font-bold transition-all border flex items-center justify-center gap-2 text-xs sm:text-sm";
  const styles = {
    default: active 
      ? 'bg-cyan-900/40 text-cyan-300 border-cyan-500/50' 
      : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200',
    danger: 'bg-red-900/20 text-red-400 border-red-900/50 hover:bg-red-900/40 hover:text-red-300',
    warning: 'bg-amber-900/20 text-amber-400 border-amber-900/50 hover:bg-amber-900/40 hover:text-amber-300'
  };

  return (
    <button onClick={onClick} className={`${base} ${styles[variant]}`}>
      {children}
    </button>
  );
};

const Slider: React.FC<{ label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }> = ({
  label, value, min, max, step, onChange
}) => (
  <div>
    <div className="flex justify-between text-xs text-cyan-300/80 mb-1">
      <span className="uppercase tracking-wider">{label}</span>
      <span className="font-mono text-cyan-400">{value.toFixed(step < 0.01 ? 3 : 1)}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
    />
  </div>
);

const ShapePreview: React.FC<{ shape: ShapeType; angle: number }> = ({ shape, angle }) => {
  const center = 50;
  const commonProps = {
    className: "fill-transparent stroke-cyan-400 stroke-[3px]",
    transform: `rotate(${angle} ${center} ${center})`
  };

  const renderShape = () => {
    switch(shape) {
      case ShapeType.CIRCLE: return <circle cx={center} cy={center} r={22} {...commonProps} />;
      case ShapeType.RECTANGLE: return <rect x={28} y={28} width={44} height={44} {...commonProps} />;
      case ShapeType.TRIANGLE: return <polygon points="50,22 78,70 22,70" {...commonProps} />;
      case ShapeType.PENTAGON: return <polygon points="50,20 79,41 68,76 32,76 21,41" {...commonProps} />;
      default: return null;
    }
  };

  return <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]">{renderShape()}</svg>;
};

export default Controls;