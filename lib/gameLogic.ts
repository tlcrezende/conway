/**
 * Conway's Game of Life - Core Game Logic
 * 
 * This module implements the core rules and algorithms for Conway's Game of Life,
 * a cellular automaton where cells evolve based on their neighbors.
 * 
 * Rules:
 * R1. Any live cell with fewer than two live neighbors dies (underpopulation)
 * R2. Any live cell with two or three live neighbors lives on to the next generation
 * R3. Any live cell with more than three live neighbors dies (overpopulation)
 * R4. Any dead cell with exactly three live neighbors becomes a live cell (reproduction)
 * 
 * Note: These rules are configurable via the CONFIG file (MIN_NEIGHBORS_TO_SURVIVE,
 * MAX_NEIGHBORS_TO_SURVIVE, NEIGHBORS_TO_REPRODUCE).
 */

import { CONFIG } from "./config";

export type BoardState = number[][];

// Counts the number of live neighbors around a cell at position (row, col)
// Checks all 8 surrounding cells (including diagonals)
// Cells outside the board boundaries are treated as dead
function countLiveNeighbors(
  board: BoardState,
  row: number,
  col: number
): number {
  const rows = board.length;
  const cols = board[0]?.length || 0;
  let count = 0;

  // Iterate through all 8 possible neighbor positions
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      // Skip the cell itself (the cell itself is not a neighbor)
      if (i === 0 && j === 0) continue;

      const newRow = row + i;
      const newCol = col + j;

      // Boundary check: out-of-bounds cells are treated as dead (0)
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

// Calculates the next generation of the board by applying Conway's rules
// Creates a new board state without mutating the original
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
        // Survival rule: live cell survives if neighbor count is within survival range
        nextRow[col] = 
          liveNeighbors === CONFIG.MIN_NEIGHBORS_TO_SURVIVE || 
          liveNeighbors === CONFIG.MAX_NEIGHBORS_TO_SURVIVE 
            ? 1 
            : 0;
      } else {
        // Reproduction rule: dead cell becomes alive if neighbor count matches reproduction threshold
        nextRow[col] = liveNeighbors === CONFIG.NEIGHBORS_TO_REPRODUCE ? 1 : 0;
      }
    }
    nextBoard.push(nextRow);
  }

  return nextBoard;
}

// Checks if two boards have identical states, used to detect stable patterns
export function boardsEqual(board1: BoardState, board2: BoardState): boolean {
  // Quick dimension checks before deep comparison
  if (board1.length !== board2.length) return false;
  if (board1.length === 0) return true;
  if (board1[0].length !== board2[0].length) return false;

  // Cell-by-cell comparison
  for (let row = 0; row < board1.length; row++) {
    for (let col = 0; col < board1[0].length; col++) {
      if (board1[row][col] !== board2[row][col]) {
        return false;
      }
    }
  }

  return true;
}

// Checks if the board is empty (all cells are dead), used to detect extinction
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

// Advances the board by N generations sequentially, more efficient than multiple API calls for large generation counts
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

/**
 * Finds the final stable state of the board through convergence detection
 * 
 * A board converges when it either:
 * 1. Becomes empty (extinction)
 * 2. Reaches a stable pattern (still life or oscillator)
 * 
 * Returns the final state and generation count, or throws if no convergence within the maximum iteration limit.
 */
export function getFinalState(
  board: BoardState,
  maxIterations: number = CONFIG.MAX_ITERATIONS
): { state: BoardState; generations: number } {
  let currentBoard = board;
  let previousBoard: BoardState | null = null;
  let generations = 0;

  while (generations < maxIterations) {
    // Convergence check 1: extinction (all cells dead)
    if (isEmpty(currentBoard)) {
      return { state: currentBoard, generations };
    }

    // Convergence check 2: stability (board unchanged from previous generation)
    // This catches both still lifes and period-1 oscillators only
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
