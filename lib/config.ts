/**
 * Centralized configuration for Conway's Game of Life
 * All magic numbers and constants are defined here
 */

export const CONFIG = {
  // Board size limits
  MAX_BOARD_SIZE: 1000,
  
  // Iteration and generation limits
  MAX_ITERATIONS: 1000,
  MAX_GENERATIONS: 1000,
  
  // Display settings
  MAX_DISPLAY_SIZE: 50,
  DEFAULT_CELL_SIZE: 12,
  
  // Default values
  DEFAULT_GENERATIONS: 10,
  DEFAULT_BOARD_ROWS: 30,
  DEFAULT_BOARD_COLS: 30,
  
  // Game rules (Conway's Game of Life)
  MIN_NEIGHBORS_TO_SURVIVE: 2,
  MAX_NEIGHBORS_TO_SURVIVE: 3,
  NEIGHBORS_TO_REPRODUCE: 3,
} as const;
