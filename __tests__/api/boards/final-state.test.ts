/**
 * @jest-environment node
 */
import { POST } from "@/app/api/boards/final-state/route";
import { prisma } from "@/lib/prisma";
import type { BoardState } from "@/lib/gameLogic";
import { CONFIG } from "@/lib/config";

// Mock Prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    board: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe("POST /api/boards/final-state", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should find final state for board that converges and return 200", async () => {
    // Single cell dies immediately (extinction)
    const currentBoard: BoardState = [[1]];

    const finalBoard: BoardState = [[0]];

    const mockBoard = {
      id: "test-id-123",
      state: JSON.stringify(currentBoard),
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
    };

    const mockUpdatedBoard = {
      ...mockBoard,
      state: JSON.stringify(finalBoard),
    };

    mockPrisma.board.findUnique.mockResolvedValue(mockBoard);
    mockPrisma.board.update.mockResolvedValue(mockUpdatedBoard);

    const request = new Request("http://localhost/api/boards/final-state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "test-id-123" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe("test-id-123");
    expect(data.generations).toBeGreaterThanOrEqual(0);
    expect(data.state).toBeDefined();
    expect(mockPrisma.board.findUnique).toHaveBeenCalledWith({
      where: { id: "test-id-123" },
    });
    expect(mockPrisma.board.update).toHaveBeenCalled();
  });

  it("should find final state for still life pattern", async () => {
    // Block pattern (still life - already stable)
    const block: BoardState = [
      [1, 1],
      [1, 1],
    ];

    const mockBoard = {
      id: "test-id-123",
      state: JSON.stringify(block),
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
    };

    const mockUpdatedBoard = {
      ...mockBoard,
      state: JSON.stringify(block),
    };

    mockPrisma.board.findUnique.mockResolvedValue(mockBoard);
    mockPrisma.board.update.mockResolvedValue(mockUpdatedBoard);

    const request = new Request("http://localhost/api/boards/final-state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "test-id-123" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe("test-id-123");
    // Block is stable, but getFinalState checks emptiness first, then advances one generation
    // before checking stability, so generations will be at least 0 (could be 0 or 1)
    expect(data.generations).toBeGreaterThanOrEqual(0);
    expect(mockPrisma.board.update).toHaveBeenCalled();
  });

  it("should return 422 for board that does not converge", async () => {
    // Blinker pattern oscillates and won't converge to a single stable state
    // within the iteration limit (it oscillates forever)
    const blinker: BoardState = [
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
    ];

    const mockBoard = {
      id: "test-id-123",
      state: JSON.stringify(blinker),
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
    };

    mockPrisma.board.findUnique.mockResolvedValue(mockBoard);

    const request = new Request("http://localhost/api/boards/final-state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "test-id-123" }),
    });

    const response = await POST(request);
    const data = await response.json();

    // Blinker oscillates, so it should eventually hit max iterations
    // But getFinalState only detects period-1 stability, so it will throw
    expect(response.status).toBe(422);
    expect(data.error).toBe("Board did not converge");
    expect(data.message).toContain("did not stabilize within");
    expect(mockPrisma.board.update).not.toHaveBeenCalled();
  });

  it("should return 404 for non-existent board", async () => {
    mockPrisma.board.findUnique.mockResolvedValue(null);

    const request = new Request("http://localhost/api/boards/final-state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "non-existent-id" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Board not found");
    expect(mockPrisma.board.update).not.toHaveBeenCalled();
  });

  it("should return 400 for invalid id (empty)", async () => {
    const request = new Request("http://localhost/api/boards/final-state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation error");
    expect(mockPrisma.board.findUnique).not.toHaveBeenCalled();
  });

  it("should return 400 for missing id", async () => {
    const request = new Request("http://localhost/api/boards/final-state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation error");
    expect(mockPrisma.board.findUnique).not.toHaveBeenCalled();
  });

  it("should return 500 for database error", async () => {
    mockPrisma.board.findUnique.mockRejectedValue(new Error("Database error"));

    const request = new Request("http://localhost/api/boards/final-state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "test-id-123" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal server error");
  });
});
