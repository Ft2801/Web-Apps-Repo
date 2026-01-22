// --- Types ---
export type Player = 'X' | 'O' | null; // Tris
export type C4Player = 'RED' | 'YELLOW' | null; // Forza 4
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

// --- TRIS (Tic-Tac-Toe) Logic ---

export const checkTrisWinner = (board: Player[]): Player | 'DRAW' | null => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];

  for (let line of lines) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  if (board.every((cell) => cell !== null)) return 'DRAW';
  return null;
};

// Minimax for Tris (Agnostic to side)
const trisMinimax = (board: Player[], depth: number, isMaximizing: boolean, aiPlayer: Player): number => {
  const result = checkTrisWinner(board);
  const humanPlayer = aiPlayer === 'X' ? 'O' : 'X';

  if (result === aiPlayer) return 10 - depth; // AI wins
  if (result === humanPlayer) return depth - 10; // Human wins
  if (result === 'DRAW') return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = aiPlayer;
        let score = trisMinimax(board, depth + 1, false, aiPlayer);
        board[i] = null;
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = humanPlayer;
        let score = trisMinimax(board, depth + 1, true, aiPlayer);
        board[i] = null;
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
};

export const getTrisBestMove = (board: Player[], difficulty: Difficulty, aiPlayer: Player): number => {
  const availableMoves = board.map((v, i) => (v === null ? i : -1)).filter((i) => i !== -1);

  // Easy: Random move
  if (difficulty === 'EASY') {
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  }

  // Hard: Minimax
  let bestScore = -Infinity;
  let move = -1;

  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = aiPlayer;
      let score = trisMinimax(board, 0, false, aiPlayer);
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
};


// --- FORZA 4 (Connect 4) Logic ---

export const ROWS = 6;
export const COLS = 7;

export const createEmptyC4Board = (): C4Player[][] => 
  Array(ROWS).fill(null).map(() => Array(COLS).fill(null));

export const checkC4Winner = (board: C4Player[][]): C4Player | 'DRAW' | null => {
  // Check horizontal
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      if (board[r][c] && board[r][c] === board[r][c + 1] && board[r][c] === board[r][c + 2] && board[r][c] === board[r][c + 3]) {
        return board[r][c];
      }
    }
  }
  // Check vertical
  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] && board[r][c] === board[r + 1][c] && board[r][c] === board[r + 2][c] && board[r][c] === board[r + 3][c]) {
        return board[r][c];
      }
    }
  }
  // Check diagonal /
  for (let r = 3; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      if (board[r][c] && board[r][c] === board[r - 1][c + 1] && board[r][c] === board[r - 2][c + 2] && board[r][c] === board[r - 3][c + 3]) {
        return board[r][c];
      }
    }
  }
  // Check diagonal \
  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      if (board[r][c] && board[r][c] === board[r + 1][c + 1] && board[r][c] === board[r + 2][c + 2] && board[r][c] === board[r + 3][c]) {
        return board[r][c];
      }
    }
  }

  // Check draw
  if (board[0].every(cell => cell !== null)) return 'DRAW';

  return null;
};

// Heuristic Evaluation for C4
const evaluateWindow = (window: C4Player[], piece: C4Player): number => {
  let score = 0;
  const oppPiece = piece === 'RED' ? 'YELLOW' : 'RED';
  const countPiece = window.filter(p => p === piece).length;
  const countEmpty = window.filter(p => p === null).length;
  const countOpp = window.filter(p => p === oppPiece).length;

  if (countPiece === 4) score += 100;
  else if (countPiece === 3 && countEmpty === 1) score += 5;
  else if (countPiece === 2 && countEmpty === 2) score += 2;

  if (countOpp === 3 && countEmpty === 1) score -= 4;

  return score;
};

const scorePosition = (board: C4Player[][], piece: C4Player): number => {
  let score = 0;
  // Center column preference
  const centerArray = board.map(row => row[Math.floor(COLS / 2)]);
  const centerCount = centerArray.filter(p => p === piece).length;
  score += centerCount * 3;

  // Horizontal
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      const window = [board[r][c], board[r][c+1], board[r][c+2], board[r][c+3]];
      score += evaluateWindow(window, piece);
    }
  }
  // Vertical
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS - 3; r++) {
      const window = [board[r][c], board[r+1][c], board[r+2][c], board[r+3][c]];
      score += evaluateWindow(window, piece);
    }
  }
  // Diagonal /
  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      const window = [board[r][c], board[r+1][c+1], board[r+2][c+2], board[r+3][c+3]];
      score += evaluateWindow(window, piece);
    }
  }
  // Diagonal \
  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      const window = [board[r+3][c], board[r+2][c+1], board[r+1][c+2], board[r][c+3]];
      score += evaluateWindow(window, piece);
    }
  }
  return score;
};

const getValidLocations = (board: C4Player[][]): number[] => {
  const valid: number[] = [];
  for (let c = 0; c < COLS; c++) {
    if (board[0][c] === null) valid.push(c);
  }
  return valid;
};

const makeMove = (board: C4Player[][], col: number, piece: C4Player): C4Player[][] => {
  const newBoard = board.map(row => [...row]);
  for (let r = ROWS - 1; r >= 0; r--) {
    if (newBoard[r][col] === null) {
      newBoard[r][col] = piece;
      return newBoard;
    }
  }
  return newBoard;
};

// Minimax with Alpha-Beta Pruning for C4
const c4Minimax = (
  board: C4Player[][], 
  depth: number, 
  alpha: number, 
  beta: number, 
  isMaximizing: boolean,
  aiPlayer: C4Player
): [number, number] => { // [score, column]
  const winner = checkC4Winner(board);
  const humanPlayer = aiPlayer === 'YELLOW' ? 'RED' : 'YELLOW';

  if (winner === aiPlayer) return [10000000, -1]; // AI Wins
  if (winner === humanPlayer) return [-10000000, -1]; // Human Wins
  if (winner === 'DRAW') return [0, -1];
  if (depth === 0) return [scorePosition(board, aiPlayer!), -1];

  const validMoves = getValidLocations(board);
  
  if (isMaximizing) { 
    let maxEval = -Infinity;
    let bestCol = validMoves[Math.floor(Math.random() * validMoves.length)];
    for (const col of validMoves) {
      const newBoard = makeMove(board, col, aiPlayer!);
      const [evalScore] = c4Minimax(newBoard, depth - 1, alpha, beta, false, aiPlayer);
      if (evalScore > maxEval) {
        maxEval = evalScore;
        bestCol = col;
      }
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return [maxEval, bestCol];
  } else { 
    let minEval = Infinity;
    let bestCol = validMoves[Math.floor(Math.random() * validMoves.length)];
    for (const col of validMoves) {
      const newBoard = makeMove(board, col, humanPlayer!);
      const [evalScore] = c4Minimax(newBoard, depth - 1, alpha, beta, true, aiPlayer);
      if (evalScore < minEval) {
        minEval = evalScore;
        bestCol = col;
      }
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return [minEval, bestCol];
  }
};

export const getC4BestMove = (board: C4Player[][], difficulty: Difficulty, aiPlayer: C4Player): number => {
  const validMoves = getValidLocations(board);

  // Easy: Random
  if (difficulty === 'EASY') {
    return validMoves[Math.floor(Math.random() * validMoves.length)];
  }

  // Medium: Shallow Minimax (depth 2)
  if (difficulty === 'MEDIUM') {
     // 50% chance to play optimal, 50% slight error or depth 2
     if (Math.random() > 0.7) {
        return validMoves[Math.floor(Math.random() * validMoves.length)];
     }
     const [_, col] = c4Minimax(board, 2, -Infinity, Infinity, true, aiPlayer);
     return col;
  }

  // Hard: Deeper Minimax (depth 4-5)
  const [_, col] = c4Minimax(board, 4, -Infinity, Infinity, true, aiPlayer);
  return col;
};

// --- Memory Game Logic ---
export interface MemoryCard {
    id: number;
    iconId: number; // 0-7
    isFlipped: boolean;
    isMatched: boolean;
}

export const generateMemoryDeck = (): MemoryCard[] => {
    const icons = [0, 1, 2, 3, 4, 5, 6, 7];
    const deck = [...icons, ...icons]
        .map((iconId, index) => ({
            id: index,
            iconId,
            isFlipped: false,
            isMatched: false
        }))
        .sort(() => Math.random() - 0.5);
    return deck;
}

// --- Rock Paper Scissors Logic ---
export type RPSMove = 'ROCK' | 'PAPER' | 'SCISSORS';

export const getRPSWinner = (p1: RPSMove, p2: RPSMove): 'PLAYER' | 'COMPUTER' | 'DRAW' => {
  if (p1 === p2) return 'DRAW';
  if (
    (p1 === 'ROCK' && p2 === 'SCISSORS') ||
    (p1 === 'PAPER' && p2 === 'ROCK') ||
    (p1 === 'SCISSORS' && p2 === 'PAPER')
  ) {
    return 'PLAYER';
  }
  return 'COMPUTER';
};

export const getRPSComputerMove = (history: RPSMove[]): RPSMove => {
  const moves: RPSMove[] = ['ROCK', 'PAPER', 'SCISSORS'];
  // Pure Random
  return moves[Math.floor(Math.random() * 3)];
};

// --- Minesweeper Logic ---
export interface MineCell {
  row: number;
  col: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborCount: number;
}

// Removed constants to allow dynamic sizing
// export const MINE_ROWS = 8;
// export const MINE_COLS = 8;
// export const MINE_COUNT = 8;

export const createMineBoard = (rows: number, cols: number): MineCell[][] => {
  let board: MineCell[][] = [];
  for(let r = 0; r < rows; r++) {
    let rowArr: MineCell[] = [];
    for(let c = 0; c < cols; c++) {
      rowArr.push({
        row: r,
        col: c,
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborCount: 0
      });
    }
    board.push(rowArr);
  }
  return board;
}

export const generateMines = (board: MineCell[][], rows: number, cols: number, mineCount: number, safeRow: number, safeCol: number) => {
  let minesPlaced = 0;
  while(minesPlaced < mineCount) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    
    // Ensure safe start and no duplicate mines
    if(!board[r][c].isMine && (r !== safeRow || c !== safeCol)) {
      board[r][c].isMine = true;
      minesPlaced++;
    }
  }

  // Calculate neighbors
  const dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
  for(let r = 0; r < rows; r++) {
    for(let c = 0; c < cols; c++) {
      if(board[r][c].isMine) continue;
      let count = 0;
      dirs.forEach(([dr, dc]) => {
        const nr = r + dr, nc = c + dc;
        if(nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].isMine) {
          count++;
        }
      });
      board[r][c].neighborCount = count;
    }
  }
  return board;
}

export const revealMineCell = (board: MineCell[][], rows: number, cols: number, r: number, c: number): MineCell[][] => {
  // If out of bounds or already revealed/flagged, stop
  if(r < 0 || r >= rows || c < 0 || c >= cols || board[r][c].isRevealed || board[r][c].isFlagged) {
    return board;
  }

  board[r][c].isRevealed = true;

  // If empty cell, recurse neighbours
  if(board[r][c].neighborCount === 0 && !board[r][c].isMine) {
    const dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
    dirs.forEach(([dr, dc]) => {
      revealMineCell(board, rows, cols, r + dr, c + dc);
    });
  }
  
  return [...board];
}
