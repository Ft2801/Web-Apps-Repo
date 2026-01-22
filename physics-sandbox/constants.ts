import { ShapeType, PhysicsSettings, GeneratorSettings } from './types';

export const COLORS = {
  blue: '#3b82f6',
  cyan: '#06b6d4',
  teal: '#14b8a6',
  white: '#ffffff',
  grid: '#1a365d',
  accent: '#facc15' // Yellow for active/selection
};

export const INITIAL_PHYSICS_SETTINGS: PhysicsSettings = {
  gravity: 1,
  friction: 0.5,
  frictionAir: 0.01,
  restitution: 0.7,
  showWalls: true
};

export const INITIAL_GENERATOR_SETTINGS: GeneratorSettings = {
  size: 40,
  angle: 0
};

export const SHAPE_CONFIGS = {
  [ShapeType.CIRCLE]: { label: 'Circle', sides: 0 },
  [ShapeType.RECTANGLE]: { label: 'Box', sides: 4 },
  [ShapeType.TRIANGLE]: { label: 'Triangle', sides: 3 },
  [ShapeType.PENTAGON]: { label: 'Pentagon', sides: 5 }
};