import React, { useState } from 'react';
import PhysicsCanvas from './components/PhysicsCanvas';
import Controls from './components/Controls';
import { PhysicsSettings, ShapeType, GeneratorSettings } from './types';
import { INITIAL_PHYSICS_SETTINGS, INITIAL_GENERATOR_SETTINGS } from './constants';

const App: React.FC = () => {
  const [settings, setSettings] = useState<PhysicsSettings>(INITIAL_PHYSICS_SETTINGS);
  const [generatorSettings, setGeneratorSettings] = useState<GeneratorSettings>(INITIAL_GENERATOR_SETTINGS);
  const [selectedShape, setSelectedShape] = useState<ShapeType>(ShapeType.RECTANGLE);
  const [clearTrigger, setClearTrigger] = useState(0);

  const handleClear = () => {
    setClearTrigger(prev => prev + 1);
  };

  const handleReset = () => {
    // Reset parameters to default
    setSettings(INITIAL_PHYSICS_SETTINGS);
    setGeneratorSettings(INITIAL_GENERATOR_SETTINGS);
    setSelectedShape(ShapeType.RECTANGLE);
    // Note: We do NOT call handleClear() here, so objects remain on screen
  };

  return (
    <div className="w-full h-screen relative overflow-hidden bg-slate-900 blueprint-grid select-none touch-none">
      {/* Physics Layer */}
      <PhysicsCanvas 
        settings={settings}
        generatorSettings={generatorSettings}
        selectedShape={selectedShape}
        onClearTrigger={clearTrigger}
      />

      {/* UI Overlay */}
      <Controls 
        settings={settings}
        setSettings={setSettings}
        generatorSettings={generatorSettings}
        setGeneratorSettings={setGeneratorSettings}
        selectedShape={selectedShape}
        setSelectedShape={setSelectedShape}
        onClear={handleClear}
        onReset={handleReset}
      />
    </div>
  );
};

export default App;