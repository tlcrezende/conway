"use client";

import { useState, useCallback } from "react";
import useSWR from "swr";
import Board from "@/components/Board";
import Controls from "@/components/Controls";
import BoardEditor from "@/components/BoardEditor";
import type { BoardState } from "@/lib/gameLogic";
import { CONFIG } from "@/lib/config";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const [boardId, setBoardId] = useState<string | null>(null);
  const [localBoard, setLocalBoard] = useState<BoardState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch board data if we have an ID
  const { data: boardData, mutate } = useSWR(
    boardId ? `/api/boards/${boardId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  // Fetch all boards for the select dropdown
  const { data: allBoards, mutate: mutateAllBoards } = useSWR(
    "/api/boards",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const currentBoard = boardData?.state || localBoard;

  // Removed useCallback - function is only used inline, no performance benefit
  const handleUpload = async (board: BoardState) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/boards/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ board }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload board");
      }

      const data = await response.json();
      setBoardId(data.id);
      setLocalBoard(data.state);
      await mutate();
      await mutateAllBoards();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextState = useCallback(async () => {
    if (!boardId) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/boards/next-state", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: boardId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get next state");
      }

      const data = await response.json();
      setLocalBoard(data.state);
      await mutate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [boardId, mutate]);

  const handleFutureState = useCallback(
    async (generations: number) => {
      if (!boardId) return;

      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/boards/future-state", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: boardId, generations }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to get future state");
        }

        const data = await response.json();
        setLocalBoard(data.state);
        await mutate();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    },
    [boardId, mutate]
  );

  const handleFinalState = useCallback(async () => {
    if (!boardId) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/boards/final-state", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: boardId }),
      });

      if (!response.ok) {
        if (response.status === 422) {
          const errorData = await response.json();
          setError(errorData.message || "Board did not converge");
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get final state");
      }

      const data = await response.json();
      setLocalBoard(data.state);
      await mutate();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [boardId, mutate]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-gray-900 dark:text-white">
            Nearsure Take Home
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
          Conway&apos;s - Game of Life
          </p>
        <span className="block text-xs text-gray-400 mt-2">
          created by Thiago Rezende
        </span>
        </header>

        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Left Column: Board Editor */}
            <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
              <BoardEditor
                rows={CONFIG.DEFAULT_BOARD_ROWS}
                cols={CONFIG.DEFAULT_BOARD_COLS}
                onBoardChange={(board) => {
                  setLocalBoard(board);
                  setBoardId(null);
                  setError(null);
                }}
              />
              <div className="mt-4">
                <button
                  onClick={() => {
                    if (localBoard) {
                      handleUpload(localBoard);
                    }
                  }}
                  disabled={!localBoard || isLoading}
                  className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? "Uploading..." : "Upload Board"}
                </button>
              </div>
            </div>

            {/* Right Column: Game Board & Controls */}
            <div className="flex flex-col gap-6">
              <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
                <h2 className="mb-4 text-xl font-semibold">Controls</h2>
                <Controls
                  boardId={boardId}
                  onNextState={handleNextState}
                  onFutureState={handleFutureState}
                  onFinalState={handleFinalState}
                  isLoading={isLoading}
                />
              </div>

              <div className="rounded-lg bg-gray-100 p-4 dark:bg-gray-700">
                {boardId && (
                  <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                    <strong>Board ID:</strong> {boardId}
                  </p>
                )}
                <div>
                  <label
                    htmlFor="board-select"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Selecionar Board:
                  </label>
                  <select
                    id="board-select"
                    value={boardId || ""}
                    onChange={async (e) => {
                      const selectedId = e.target.value;
                      if (selectedId) {
                        setBoardId(selectedId);
                        setError(null);
                        setIsLoading(true);
                        try {
                          const response = await fetch(
                            `/api/boards/${selectedId}`
                          );
                          if (!response.ok) {
                            throw new Error("Failed to load board");
                          }
                          const data = await response.json();
                          setLocalBoard(data.state);
                          await mutate();
                        } catch (err) {
                          setError(
                            err instanceof Error
                              ? err.message
                              : "Unknown error"
                          );
                        } finally {
                          setIsLoading(false);
                        }
                      } else {
                        setBoardId(null);
                        setLocalBoard(null);
                      }
                    }}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
                  >
                    <option value="">-- Select a board --</option>
                    {allBoards?.map((board: { id: string; createdAt: string }) => (
                      <option key={board.id} value={board.id}>
                        {board.id} -{" "}
                        {new Date(board.createdAt).toLocaleString("pt-BR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-red-100 p-4 text-red-700 dark:bg-red-900 dark:text-red-200">
                  <p className="font-semibold">Error:</p>
                  <p>{error}</p>
                </div>
              )}

              <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
                <h2 className="mb-4 text-xl font-semibold">Current State</h2>
                {currentBoard ? (
                  <Board state={currentBoard} cellSize={CONFIG.DEFAULT_CELL_SIZE} />
                ) : (
                  <div className="flex items-center justify-center p-8 text-gray-500">
                    No board loaded. Create and upload a board to start.
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
