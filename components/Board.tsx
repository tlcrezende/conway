"use client";

import { memo, useMemo } from "react";
import Cell from "./Cell";
import type { BoardState } from "@/lib/gameLogic";
import { CONFIG } from "@/lib/config";

interface BoardProps {
  state: BoardState;
  cellSize?: number;
  maxDisplaySize?: number;
}

const Board = memo(function Board({
  state,
  cellSize = CONFIG.DEFAULT_CELL_SIZE,
  maxDisplaySize = CONFIG.MAX_DISPLAY_SIZE,
}: BoardProps) {
  // Calculate display dimensions with cropping for large boards
  // Prevents performance issues when rendering very large boards
  const displayState = useMemo(() => {
    if (state.length === 0 || state[0]?.length === 0) {
      return [];
    }

    const rows = state.length;
    const cols = state[0].length;

    // Crop board if it exceeds maximum display size
    if (rows > maxDisplaySize || cols > maxDisplaySize) {
      const cropped: BoardState = [];
      const maxRows = Math.min(rows, maxDisplaySize);
      const maxCols = Math.min(cols, maxDisplaySize);

      // Extract top-left portion of the board
      for (let i = 0; i < maxRows; i++) {
        cropped.push(state[i].slice(0, maxCols));
      }

      return cropped;
    }

    return state;
  }, [state, maxDisplaySize]);

  const actualRows = state.length;
  const actualCols = state[0]?.length || 0;
  const displayRows = displayState.length;
  const displayCols = displayState[0]?.length || 0;
  const isCropped = actualRows > maxDisplaySize || actualCols > maxDisplaySize;

  if (displayState.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-500">
        Empty board
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {isCropped && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Displaying {displayRows}x{displayCols} of {actualRows}x{actualCols}
        </div>
      )}
      <div
        className="inline-flex flex-col border-2 border-gray-400 dark:border-gray-600"
        role="grid"
        aria-label={`Game board: ${actualRows} rows by ${actualCols} columns`}
      >
        {displayState.map((row, rowIndex) => (
          <div key={rowIndex} className="flex" role="row">
            {row.map((cell, colIndex) => (
              <Cell
                key={`${rowIndex}-${colIndex}`}
                isAlive={cell === 1}
                size={cellSize}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
});

export default Board;
