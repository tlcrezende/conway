"use client";

import { memo } from "react";

interface CellProps {
  isAlive: boolean;
  size?: number;
}

const Cell = memo(function Cell({ isAlive, size = 20 }: CellProps) {
  return (
    <div
      className={`border border-gray-300 transition-colors duration-150 ${
        isAlive
          ? "bg-black dark:bg-white"
          : "bg-white dark:bg-gray-900"
      }`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
      }}
      aria-label={isAlive ? "Alive cell" : "Dead cell"}
    />
  );
});

export default Cell;
