import { GridType, NodeType } from '../types';

// Helper to get all nodes from the grid
const getAllNodes = (grid: GridType): NodeType[] => {
  const nodes: NodeType[] = [];
  for (const row of grid) {
    for (const node of row) {
      nodes.push(node);
    }
  }
  return nodes;
};

// Sort nodes by distance (for Dijkstra)
const sortNodesByDistance = (unvisitedNodes: NodeType[]) => {
  unvisitedNodes.sort((nodeA, nodeB) => nodeA.distance - nodeB.distance);
};

// Sort nodes by total distance (for A*)
const sortNodesByTotalDistance = (unvisitedNodes: NodeType[]) => {
  unvisitedNodes.sort((nodeA, nodeB) => nodeA.totalDistance - nodeB.totalDistance);
};

// Update unvisited neighbors
const updateUnvisitedNeighbors = (node: NodeType, grid: GridType) => {
  const unvisitedNeighbors = getUnvisitedNeighbors(node, grid);
  for (const neighbor of unvisitedNeighbors) {
    neighbor.distance = node.distance + 1;
    neighbor.previousNode = node;
  }
};

// Get unvisited neighbors (up, down, left, right)
const getUnvisitedNeighbors = (node: NodeType, grid: GridType): NodeType[] => {
  const neighbors: NodeType[] = [];
  const { col, row } = node;
  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
  return neighbors.filter((neighbor) => !neighbor.isVisited);
};

// Backtrack from finish node to find the path
export const getNodesInShortestPathOrder = (finishNode: NodeType): NodeType[] => {
  const nodesInShortestPathOrder: NodeType[] = [];
  let currentNode: NodeType | null = finishNode;
  while (currentNode !== null) {
    nodesInShortestPathOrder.unshift(currentNode);
    currentNode = currentNode.previousNode;
  }
  return nodesInShortestPathOrder;
};

// Dijkstra Algorithm
export const dijkstra = (grid: GridType, startNode: NodeType, finishNode: NodeType): NodeType[] => {
  const visitedNodesInOrder: NodeType[] = [];
  startNode.distance = 0;
  const unvisitedNodes = getAllNodes(grid);

  while (unvisitedNodes.length > 0) {
    sortNodesByDistance(unvisitedNodes);
    const closestNode = unvisitedNodes.shift();

    // If we encounter a wall, skip it
    if (closestNode?.isWall) continue;

    // If the closest node is at a distance of infinity, we're trapped
    if (closestNode?.distance === Infinity) return visitedNodesInOrder;

    if (closestNode) {
        closestNode.isVisited = true;
        visitedNodesInOrder.push(closestNode);
    
        if (closestNode === finishNode) return visitedNodesInOrder;
    
        updateUnvisitedNeighbors(closestNode, grid);
    }
  }
  return visitedNodesInOrder;
};

// A* Algorithm
export const aStar = (grid: GridType, startNode: NodeType, finishNode: NodeType): NodeType[] => {
  const visitedNodesInOrder: NodeType[] = [];
  startNode.distance = 0; // g cost
  startNode.totalDistance = 0; // f cost
  startNode.heuristicDistance = 0; // h cost

  const unvisitedNodes = getAllNodes(grid);

  while (unvisitedNodes.length > 0) {
    sortNodesByTotalDistance(unvisitedNodes);
    const closestNode = unvisitedNodes.shift();

    if (!closestNode || closestNode.isWall) continue;

    // If calculate distance is infinity, we are trapped
    if (closestNode.distance === Infinity) return visitedNodesInOrder;

    closestNode.isVisited = true;
    visitedNodesInOrder.push(closestNode);

    if (closestNode === finishNode) return visitedNodesInOrder;

    const neighbors = getUnvisitedNeighbors(closestNode, grid);
    
    for (const neighbor of neighbors) {
      // Calculate temp g score
      const tentativeDistance = closestNode.distance + 1;
      
      // If we found a better path or the neighbor hasn't been visited (initially inf)
      if (tentativeDistance < neighbor.distance) {
          neighbor.distance = tentativeDistance;
          // Manhattan Distance
          neighbor.heuristicDistance = Math.abs(neighbor.row - finishNode.row) + Math.abs(neighbor.col - finishNode.col);
          neighbor.totalDistance = neighbor.distance + neighbor.heuristicDistance;
          neighbor.previousNode = closestNode;
      }
    }
  }
  return visitedNodesInOrder;
};
