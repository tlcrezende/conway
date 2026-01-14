"use client";

import { useState, memo } from "react";

interface ControlsProps {
  boardId: string | null;
  onNextState: () => Promise<void>;
  onFutureState: (generations: number) => Promise<void>;
  onFinalState: () => Promise<void>;
  isLoading?: boolean;
}

const Controls = memo(function Controls({
  boardId,
  onNextState,
  onFutureState,
  onFinalState,
  isLoading = false,
}: ControlsProps) {
  const [generations, setGenerations] = useState(10);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleNextState = async () => {
    setIsProcessing(true);
    try {
      await onNextState();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFutureState = async () => {
    setIsProcessing(true);
    try {
      await onFutureState(generations);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinalState = async () => {
    setIsProcessing(true);
    try {
      await onFinalState();
    } finally {
      setIsProcessing(false);
    }
  };

  const disabled = !boardId || isLoading || isProcessing;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleNextState}
          disabled={disabled}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next State
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleFutureState}
            disabled={disabled}
            className="rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Future State
          </button>
          <input
            type="number"
            min="1"
            max="1000"
            value={generations}
            onChange={(e) => setGenerations(Number(e.target.value))}
            disabled={disabled}
            className="w-20 rounded border border-gray-300 px-2 py-1 text-center disabled:cursor-not-allowed disabled:opacity-50"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            generations
          </span>
        </div>

        <button
          onClick={handleFinalState}
          disabled={disabled}
          className="rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Final State
        </button>
      </div>

      {isProcessing && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Processing...
        </div>
      )}
    </div>
  );
});

export default Controls;
