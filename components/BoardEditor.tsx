"use client";

import { useState, useCallback, useMemo, memo } from "react";
import type { BoardState } from "@/lib/gameLogic";

interface BoardEditorProps {
  rows: number;
  cols: number;
  onBoardChange: (board: BoardState) => void;
}

interface EditorCellProps {
  isAlive: boolean;
  row: number;
  col: number;
  onToggle: (row: number, col: number) => void;
}

const EditorCell = memo(function EditorCell({
  isAlive,
  row,
  col,
  onToggle,
}: EditorCellProps) {
  const handleClick = useCallback(() => {
    onToggle(row, col);
  }, [row, col, onToggle]);

  return (
    <button
      onClick={handleClick}
      className={`h-4 w-6 border border-gray-300 transition-colors ${
        isAlive
          ? "bg-black dark:bg-white"
          : "bg-white hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800"
      }`}
      aria-label={`Cell ${row},${col}: ${isAlive ? "Alive" : "Dead"}`}
    />
  );
});

export default function BoardEditor({
  rows,
  cols,
  onBoardChange,
}: BoardEditorProps) {
  
  // Initialize empty board only when dimensions change
  const initialBoard = useMemo<BoardState>(
    () =>
      Array(rows)
        .fill(null)
        .map(() => Array(cols).fill(0)),
    [rows, cols]
  );

  const [board, setBoard] = useState<BoardState>(initialBoard);

  const toggleCell = useCallback(
    (row: number, col: number) => {
      setBoard((prevBoard) => {
        const updatedBoard = prevBoard.map((rowArray, rowIndex) =>
          rowIndex === row
            ? rowArray.map((cellValue, colIndex) =>
                colIndex === col ? (cellValue === 1 ? 0 : 1) : cellValue
              )
            : rowArray
        );

        // Notify parent component of changes
        onBoardChange(updatedBoard);
        return updatedBoard;
      });
    },
    [onBoardChange]
  );

  const clearBoard = useCallback(() => {
    setBoard(initialBoard);
    onBoardChange(initialBoard);
  }, [initialBoard, onBoardChange]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Edit Board</h3>
        <button
          onClick={clearBoard}
          className="rounded bg-gray-200 px-3 py-1 text-sm transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
        >
          Clear
        </button>
      </div>
      <div className="inline-flex flex-col border-2 border-gray-400 dark:border-gray-600">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="flex">
            {row.map((cell, colIndex) => (
              <EditorCell
                key={`${rowIndex}-${colIndex}`}
                isAlive={cell === 1}
                row={rowIndex}
                col={colIndex}
                onToggle={toggleCell}
              />
            ))}
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Click cells to toggle them alive/dead
      </p>
    </div>
  );
}
