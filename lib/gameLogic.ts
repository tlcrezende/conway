/**
 * Rules:
 * R1. Any live cell with fewer than two live neighbors dies (underpopulation)
 * R2. Any live cell with two or three live neighbors lives on to the next generation
 * R3. Any live cell with more than three live neighbors dies (overpopulation)
 * R4. Any dead cell with exactly three live neighbors becomes a live cell (reproduction)
 * 
 * Obs: These rules are the orignal rules, but we can change them based on the CONFIG file.
 */

import { CONFIG } from "./config";

export type BoardState = number[][];

// Counts the number of live neighbors around a cell at position (row, col)
function countLiveNeighbors(
  board: BoardState,
  row: number,
  col: number
): number {
  const rows = board.length;
  const cols = board[0]?.length || 0;
  let count = 0;

  // Check all 8 neighbors
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      // Skip the cell itself (the cell itself is not a neighbor)
      if (i === 0 && j === 0) continue;

      const newRow = row + i;
      const newCol = col + j;

      // Check boundaries: if out of bounds, treat as dead
      if (
        newRow >= 0 &&
        newRow < rows &&
        newCol >= 0 &&
        newCol < cols &&
        board[newRow][newCol] === 1
      ) {
        count++;
      }
    }
  }

  return count;
}

// Calculates the next generation of the board
export function getNextGeneration(board: BoardState): BoardState {
  if (board.length === 0 || board[0]?.length === 0) {
    return board;
  }

  const rows = board.length;
  const cols = board[0].length;
  const nextBoard: BoardState = [];

  for (let row = 0; row < rows; row++) {
    const nextRow: number[] = [];
    for (let col = 0; col < cols; col++) {
      const liveNeighbors = countLiveNeighbors(board, row, col);
      const isAlive = board[row][col] === 1;

      if (isAlive) {
        // Live cell survives if it has 2 or 3 neighbors (R1-R2-R3)
        nextRow[col] = 
          liveNeighbors === CONFIG.MIN_NEIGHBORS_TO_SURVIVE || 
          liveNeighbors === CONFIG.MAX_NEIGHBORS_TO_SURVIVE 
            ? 1 
            : 0;
      } else {
        // Dead cell becomes alive if it has exactly 3 neighbors (R4)
        nextRow[col] = liveNeighbors === CONFIG.NEIGHBORS_TO_REPRODUCE ? 1 : 0;
      }
    }
    nextBoard.push(nextRow);
  }

  return nextBoard;
}

// Checks if two boards are equal
export function boardsEqual(board1: BoardState, board2: BoardState): boolean {
  if (board1.length !== board2.length) return false;
  if (board1.length === 0) return true;
  if (board1[0].length !== board2[0].length) return false;


  for (let row = 0; row < board1.length; row++) {
    for (let col = 0; col < board1[0].length; col++) {
      if (board1[row][col] !== board2[row][col]) {
        return false;
      }
    }
  }

  return true;
}

// Checks if the board is empty (all cells are dead)
export function isEmpty(board: BoardState): boolean {
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      if (board[row][col] === 1) {
        return false;
      }
    }
  }
  return true;
}

// Advances the board by N generations
export function getFutureState(
  board: BoardState,
  generations: number
): BoardState {
  let currentBoard = board;
  for (let i = 0; i < generations; i++) {
    currentBoard = getNextGeneration(currentBoard);
  }
  return currentBoard;
}

// Finds the final stable state of the board
// Returns the board state and the number of generations it took
// Throws an error if it doesn't stabilize within maxIterations
export function getFinalState(
  board: BoardState,
  maxIterations: number = CONFIG.MAX_ITERATIONS
): { state: BoardState; generations: number } {
  let currentBoard = board;
  let previousBoard: BoardState | null = null;
  let generations = 0;

  while (generations < maxIterations) {
    // Check if board is empty
    if (isEmpty(currentBoard)) {
      return { state: currentBoard, generations };
    }

    // Check if board is stable (same as previous generation)
    if (previousBoard !== null && boardsEqual(currentBoard, previousBoard)) {
      return { state: currentBoard, generations };
    }

    previousBoard = currentBoard;
    currentBoard = getNextGeneration(currentBoard);
    generations++;
  }

  throw new Error(
    `Board did not converge within ${maxIterations} iterations`
  );
}
