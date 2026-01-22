export enum AlgorithmType {
  DIJKSTRA = 'Dijkstra',
  A_STAR = 'A*',
}

export type NodeType = {
  row: number;
  col: number;
  isStart: boolean;
  isFinish: boolean;
  isWall: boolean;
  isVisited: boolean;
  distance: number;
  previousNode: NodeType | null;
  // A* specific
  totalDistance: number; // f = g + h
  heuristicDistance: number; // h
};

export type GridType = NodeType[][];

export interface VisualizationStats {
  visitedCount: number;
  pathLength: number;
  executionTime: number;
}
