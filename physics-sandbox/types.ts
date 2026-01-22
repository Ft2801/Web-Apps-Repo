export enum ShapeType {
  CIRCLE = 'CIRCLE',
  RECTANGLE = 'RECTANGLE',
  TRIANGLE = 'TRIANGLE',
  PENTAGON = 'PENTAGON'
}

export interface PhysicsSettings {
  gravity: number;
  friction: number;
  frictionAir: number; // New: Air resistance
  restitution: number; // Bounciness
  showWalls: boolean;
}

export interface GeneratorSettings {
  size: number;
  angle: number; // In degrees
}

export interface Wall {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
}