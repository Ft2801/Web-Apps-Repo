import React, { useState } from 'react';
import { Scene } from './components/Scene';
import { CustomCursor } from './components/CustomCursor';
import { UIOverlay } from './components/UIOverlay';

export interface SceneSettings {
  moveSpeed: number;
  rotSpeed: number;
  shadowIntensity: number;
  numSquares: number;
  directionAngle: number;
}

const DEFAULT_SETTINGS: SceneSettings = {
  moveSpeed: 1.0,
  rotSpeed: 1.0,
  shadowIntensity: 0.5,
  numSquares: 30,
  directionAngle: 45,
};

const App: React.FC = () => {
  const [settings, setSettings] = useState<SceneSettings>(DEFAULT_SETTINGS);

  return (
    <div className="relative w-screen h-screen bg-slate-900 overflow-hidden">
      <CustomCursor />
      
      <UIOverlay 
        settings={settings} 
        onUpdate={setSettings} 
        onReset={() => setSettings(DEFAULT_SETTINGS)}
      />

      <div className="absolute inset-0 z-0">
        <Scene settings={settings} />
      </div>
    </div>
  );
};

export default App;