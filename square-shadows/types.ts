export interface CubeProps {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  color: string;
  speed: number;
}

export interface LightSourceProps {
  intensity?: number;
  color?: string;
}
