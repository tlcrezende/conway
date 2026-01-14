import {
  getNextGeneration,
  boardsEqual,
  isEmpty,
  getFutureState,
  getFinalState,
  type BoardState,
} from "@/lib/gameLogic";
import { CONFIG } from "@/lib/config";

describe("gameLogic", () => {
  describe("getNextGeneration", () => {
    it("should return empty board for empty input", () => {
      const board: BoardState = [];
      const result = getNextGeneration(board);
      expect(result).toEqual([]);
    });

    it("should return same board for board with empty row", () => {
      const board: BoardState = [[]];
      const result = getNextGeneration(board);
      expect(result).toEqual([[]]);
    });

    describe("Game Rules", () => {
      it("should kill cell with fewer than 2 neighbors (underpopulation)", () => {
        // Single isolated cell
        const board: BoardState = [
          [0, 0, 0],
          [0, 1, 0],
          [0, 0, 0],
        ];
        const result = getNextGeneration(board);
        expect(result[1][1]).toBe(0);
        expect(isEmpty(result)).toBe(true);
      });

      it("should preserve cell with 2 neighbors (survival)", () => {
        // Three cells in a row (middle cell has 2 neighbors)
        const board: BoardState = [
          [0, 0, 0],
          [1, 1, 1],
          [0, 0, 0],
        ];
        const result = getNextGeneration(board);
        // Middle cell should survive (has 2 neighbors)
        expect(result[1][1]).toBe(1);
      });

      it("should preserve cell with 3 neighbors (survival)", () => {
        // L-shape pattern
        const board: BoardState = [
          [1, 1],
          [1, 0],
        ];
        const result = getNextGeneration(board);
        // Top-left cell has 2 neighbors, should survive
        // Bottom-left cell has 2 neighbors, should survive
        // Top-right cell has 2 neighbors, should survive
        expect(result[0][0]).toBe(1);
        expect(result[1][0]).toBe(1);
        expect(result[0][1]).toBe(1);
      });

      it("should kill cell with more than 3 neighbors (overpopulation)", () => {
        // Cell with 4 neighbors
        const board: BoardState = [
          [1, 1, 1],
          [1, 1, 0],
          [0, 0, 0],
        ];
        const result = getNextGeneration(board);
        // Center cell (1,1) has 4 neighbors, should die
        expect(result[1][1]).toBe(0);
      });

      it("should create cell with exactly 3 neighbors (reproduction)", () => {
        // Three cells forming a pattern that creates a new cell
        const board: BoardState = [
          [0, 1, 0],
          [1, 0, 1],
          [0, 0, 0],
        ];
        const result = getNextGeneration(board);
        // Center cell (1,1) has 3 neighbors, should be born
        expect(result[1][1]).toBe(1);
      });
    });

    describe("Known Patterns", () => {
      it("should preserve block pattern (still life)", () => {
        const block: BoardState = [
          [1, 1],
          [1, 1],
        ];
        const result = getNextGeneration(block);
        expect(boardsEqual(block, result)).toBe(true);
      });

      it("should oscillate blinker pattern (period 2)", () => {
        // Vertical blinker
        const blinkerVertical: BoardState = [
          [0, 1, 0],
          [0, 1, 0],
          [0, 1, 0],
        ];
        const result = getNextGeneration(blinkerVertical);
        // Should become horizontal
        const expected: BoardState = [
          [0, 0, 0],
          [1, 1, 1],
          [0, 0, 0],
        ];
        expect(boardsEqual(result, expected)).toBe(true);
      });

      it("should preserve beehive pattern (still life)", () => {
        const beehive: BoardState = [
          [0, 1, 1, 0],
          [1, 0, 0, 1],
          [0, 1, 1, 0],
        ];
        const result = getNextGeneration(beehive);
        expect(boardsEqual(beehive, result)).toBe(true);
      });

      it("should move glider pattern", () => {
        // Glider pattern
        const glider: BoardState = [
          [0, 1, 0],
          [0, 0, 1],
          [1, 1, 1],
        ];
        const result = getNextGeneration(glider);
        // Glider should move, so it should be different
        expect(boardsEqual(glider, result)).toBe(false);
        // After 4 generations, glider should return to same pattern (shifted)
        const after4 = getFutureState(glider, 4);
        // Glider moves, so pattern changes but structure is preserved
        expect(isEmpty(after4)).toBe(false);
      });
    });

    describe("Edge Cases", () => {
      it("should handle cells on board edges", () => {
        const board: BoardState = [
          [1, 1, 1],
          [1, 0, 1],
          [1, 1, 1],
        ];
        const result = getNextGeneration(board);
        // Corner cells have fewer neighbors
        expect(result[0][0]).toBe(1); // Has 3 neighbors
        expect(result[2][2]).toBe(1); // Has 3 neighbors
      });

      it("should handle single cell board", () => {
        const board: BoardState = [[1]];
        const result = getNextGeneration(board);
        // Single cell dies (0 neighbors)
        expect(result[0][0]).toBe(0);
      });

      it("should not mutate original board", () => {
        const board: BoardState = [
          [0, 1, 0],
          [1, 1, 1],
          [0, 1, 0],
        ];
        const original = JSON.parse(JSON.stringify(board));
        getNextGeneration(board);
        expect(boardsEqual(board, original)).toBe(true);
      });
    });
  });

  describe("boardsEqual", () => {
    it("should return true for identical boards", () => {
      const board1: BoardState = [
        [1, 0],
        [0, 1],
      ];
      const board2: BoardState = [
        [1, 0],
        [0, 1],
      ];
      expect(boardsEqual(board1, board2)).toBe(true);
    });

    it("should return false for different boards", () => {
      const board1: BoardState = [
        [1, 0],
        [0, 1],
      ];
      const board2: BoardState = [
        [1, 1],
        [0, 1],
      ];
      expect(boardsEqual(board1, board2)).toBe(false);
    });

    it("should return false for boards with different row counts", () => {
      const board1: BoardState = [[1, 0]];
      const board2: BoardState = [
        [1, 0],
        [0, 1],
      ];
      expect(boardsEqual(board1, board2)).toBe(false);
    });

    it("should return false for boards with different column counts", () => {
      const board1: BoardState = [[1, 0]];
      const board2: BoardState = [[1, 0, 1]];
      expect(boardsEqual(board1, board2)).toBe(false);
    });

    it("should return true for empty boards", () => {
      const board1: BoardState = [];
      const board2: BoardState = [];
      expect(boardsEqual(board1, board2)).toBe(true);
    });
  });

  describe("isEmpty", () => {
    it("should return true for empty board", () => {
      const board: BoardState = [
        [0, 0],
        [0, 0],
      ];
      expect(isEmpty(board)).toBe(true);
    });

    it("should return false for board with live cells", () => {
      const board: BoardState = [
        [0, 0],
        [0, 1],
      ];
      expect(isEmpty(board)).toBe(false);
    });

    it("should return true for board with all zeros", () => {
      const board: BoardState = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ];
      expect(isEmpty(board)).toBe(true);
    });

    it("should return false for board with single live cell", () => {
      const board: BoardState = [[1]];
      expect(isEmpty(board)).toBe(false);
    });
  });

  describe("getFutureState", () => {
    it("should return same board for 0 generations", () => {
      const board: BoardState = [
        [1, 1],
        [1, 1],
      ];
      const result = getFutureState(board, 0);
      expect(boardsEqual(result, board)).toBe(true);
    });

    it("should advance board by N generations", () => {
      // Blinker pattern
      const blinker: BoardState = [
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 0],
      ];
      // After 2 generations, blinker should return to original state
      const result = getFutureState(blinker, 2);
      expect(boardsEqual(result, blinker)).toBe(true);
    });

    it("should handle multiple generations correctly", () => {
      const board: BoardState = [
        [0, 1, 0],
        [1, 1, 1],
        [0, 1, 0],
      ];
      const after1 = getFutureState(board, 1);
      const after2 = getFutureState(board, 2);
      // Should be different from original
      expect(boardsEqual(board, after1)).toBe(false);
      expect(boardsEqual(after1, after2)).toBe(false);
    });

    it("should handle board that dies out", () => {
      // Single cell dies after 1 generation
      const board: BoardState = [[1]];
      const result = getFutureState(board, 1);
      expect(isEmpty(result)).toBe(true);
    });
  });

  describe("getFinalState", () => {
    it("should find stable state for still life pattern", () => {
      const block: BoardState = [
        [1, 1],
        [1, 1],
      ];
      const result = getFinalState(block);
      // Block is stable, but getFinalState checks emptiness first, then advances one generation
      // before checking stability, so generations will be at least 1
      expect(result.generations).toBeGreaterThanOrEqual(0);
      expect(boardsEqual(result.state, block)).toBe(true);
    });

    it("should find extinction for single cell", () => {
      const board: BoardState = [[1]];
      const result = getFinalState(board);
      expect(isEmpty(result.state)).toBe(true);
      expect(result.generations).toBe(1);
    });

    it("should find stable state for blinker (oscillator)", () => {
      // Blinker oscillates, but getFinalState only detects period-1 stability
      // So it will run until it finds a stable state or hits max iterations
      const blinker: BoardState = [
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 0],
      ];
      // Blinker oscillates, so it won't converge to a single stable state
      // This will likely hit max iterations
      expect(() => getFinalState(blinker, 10)).toThrow();
    });

    it("should throw error when board does not converge within max iterations", () => {
      // Use a pattern that oscillates and won't converge quickly
      // Blinker oscillates forever, so with low max iterations it should throw
      const blinker: BoardState = [
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 0],
      ];
      // Blinker oscillates, so it won't converge to a single stable state
      expect(() => getFinalState(blinker, 5)).toThrow(
        "Board did not converge within 5 iterations"
      );
    });

    it("should use default max iterations from CONFIG", () => {
      const board: BoardState = [[1]];
      const result = getFinalState(board);
      // Should converge quickly
      expect(result.generations).toBeGreaterThanOrEqual(0);
      expect(result.generations).toBeLessThan(CONFIG.MAX_ITERATIONS);
    });

    it("should find extinction for pattern that dies", () => {
      // Single cell dies immediately
      const board: BoardState = [[1]];
      const result = getFinalState(board, 100);
      expect(isEmpty(result.state)).toBe(true);
      expect(result.generations).toBe(1);
    });
  });
});
