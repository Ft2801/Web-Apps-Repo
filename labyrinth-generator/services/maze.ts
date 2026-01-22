import { GridType, NodeType } from "../types";

// Kruskal's Algorithm for Maze Generation
// Generates a Minimum Spanning Tree (MST) on the grid, resulting in a perfect maze.
export const generateMaze = (
  grid: GridType,
  startNode: NodeType,
  finishNode: NodeType
): GridType => {
  const height = grid.length;
  const width = grid[0].length;

  // 1. Initialize grid: Everything is a wall initially
  // We keep the node properties but reset walls, distance, etc.
  // Note: We create a deep copy structure to return
  const newGrid = grid.map(row => 
    row.map(node => ({ 
      ...node, 
      isWall: true, 
      isVisited: false,
      distance: Infinity,
      totalDistance: Infinity
    }))
  );

  // 2. Setup for Disjoint Set (Union-Find)
  // We treat nodes with odd coordinates (r, c) as "cells" or "rooms"
  // Even coordinates are initially walls.
  const getIndex = (r: number, c: number) => r * width + c;
  const parent = new Array(height * width).fill(0).map((_, i) => i);

  const find = (i: number): number => {
    let root = i;
    while (root !== parent[root]) {
      root = parent[root];
    }
    // Path compression
    let curr = i;
    while (curr !== root) {
      let next = parent[curr];
      parent[curr] = root;
      curr = next;
    }
    return root;
  };

  const union = (i: number, j: number) => {
    const rootI = find(i);
    const rootJ = find(j);
    if (rootI !== rootJ) {
      parent[rootI] = rootJ;
      return true;
    }
    return false;
  };

  // 3. Create List of Edges
  // An edge exists between two adjacent "rooms" separated by a wall.
  // Rooms are at odd indices: (1,1), (1,3), (3,1), etc.
  type Edge = {
    r1: number; c1: number; // Room 1
    r2: number; c2: number; // Room 2
    wr: number; wc: number; // Wall between them
  };
  
  const edges: Edge[] = [];

  // Iterate only odd rows and cols to find rooms
  for (let r = 1; r < height - 1; r += 2) {
    for (let c = 1; c < width - 1; c += 2) {
      // Horizontal neighbor (Right)
      if (c + 2 < width - 1) {
        edges.push({ r1: r, c1: c, r2: r, c2: c + 2, wr: r, wc: c + 1 });
      }
      // Vertical neighbor (Down)
      if (r + 2 < height - 1) {
        edges.push({ r1: r, c1: c, r2: r + 2, c2: c, wr: r + 1, wc: c });
      }
    }
  }

  // 4. Shuffle Edges (Fisher-Yates)
  for (let i = edges.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [edges[i], edges[j]] = [edges[j], edges[i]];
  }

  // 5. Carve Maze using Kruskal's
  // Iterate edges; if rooms are unconnected, join them and knock down the wall
  for (const edge of edges) {
    const idx1 = getIndex(edge.r1, edge.c1);
    const idx2 = getIndex(edge.r2, edge.c2);

    if (union(idx1, idx2)) {
      newGrid[edge.r1][edge.c1].isWall = false;
      newGrid[edge.r2][edge.c2].isWall = false;
      newGrid[edge.wr][edge.wc].isWall = false;
    }
  }

  // 6. Ensure Start and Finish are accessible
  // Since we only carved "odd" coordinates, the Start/End might be on an "even" wall coordinate.
  const ensureOpen = (r: number, c: number) => {
      newGrid[r][c].isWall = false;
      
      // Check if it's isolated (all neighbors are walls)
      // If so, open a random neighbor to connect it to the maze
      const directions = [
          { dr: -1, dc: 0 }, { dr: 1, dc: 0 }, 
          { dr: 0, dc: -1 }, { dr: 0, dc: 1 }
      ];
      
      let hasOpenNeighbor = false;
      const validNeighbors: {r: number, c: number}[] = [];

      for (const {dr, dc} of directions) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < height && nc >= 0 && nc < width) {
              validNeighbors.push({r: nr, c: nc});
              if (!newGrid[nr][nc].isWall) {
                  hasOpenNeighbor = true;
              }
          }
      }

      if (!hasOpenNeighbor && validNeighbors.length > 0) {
          // Find closest "Room" or just pick random neighbor
          const rand = validNeighbors[Math.floor(Math.random() * validNeighbors.length)];
          newGrid[rand.r][rand.c].isWall = false;
      }
  };

  ensureOpen(startNode.row, startNode.col);
  ensureOpen(finishNode.row, finishNode.col);

  return newGrid;
};
