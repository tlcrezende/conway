import { z } from "zod";

/**
 * Validates that the input is a valid board matrix
 * A board must be a 2D array of 0s and 1s
 */
export const boardSchema = z
  .array(z.array(z.union([z.literal(0), z.literal(1)])))
  .refine(
    (board) => {
      if (board.length === 0) return false;
      const firstRowLength = board[0]?.length || 0;
      if (firstRowLength === 0) return false;
      // All rows must have the same length
      return board.every((row) => row.length === firstRowLength);
    },
    {
      message: "Board must be a non-empty 2D array with consistent row lengths",
    }
  )
  .refine(
    (board) => {
      // Limit board size to prevent performance issues
      const maxSize = 1000;
      return (
        board.length <= maxSize &&
        (board[0]?.length || 0) <= maxSize
      );
    },
    {
      message: `Board dimensions must not exceed ${1000}x${1000}`,
    }
  );

export const uploadBoardSchema = z.object({
  board: boardSchema,
});

export const getNextStateSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

export const getFutureStateSchema = z.object({
  id: z.string().min(1, "ID is required"),
  generations: z
    .number()
    .int()
    .positive()
    .max(1000, "Maximum 1000 generations allowed"),
});

export const getFinalStateSchema = z.object({
  id: z.string().min(1, "ID is required"),
});
