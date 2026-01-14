/**
 * @jest-environment node
 */
import { POST } from "@/app/api/boards/future-state/route";
import { prisma } from "@/lib/prisma";
import type { BoardState } from "@/lib/gameLogic";

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

describe("POST /api/boards/future-state", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should calculate future state and return 200", async () => {
    const currentBoard: BoardState = [
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
    ];

    const mockBoard = {
      id: "test-id-123",
      state: JSON.stringify(currentBoard),
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
    };

    // Blinker oscillates, so after 2 generations it returns to original
    const futureBoard = currentBoard; // After 2 generations, blinker returns

    const mockUpdatedBoard = {
      ...mockBoard,
      state: JSON.stringify(futureBoard),
    };

    mockPrisma.board.findUnique.mockResolvedValue(mockBoard);
    mockPrisma.board.update.mockResolvedValue(mockUpdatedBoard);

    const request = new Request("http://localhost/api/boards/future-state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "test-id-123", generations: 2 }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe("test-id-123");
    expect(data.generations).toBe(2);
    expect(data.state).toBeDefined();
    expect(mockPrisma.board.findUnique).toHaveBeenCalledWith({
      where: { id: "test-id-123" },
    });
    expect(mockPrisma.board.update).toHaveBeenCalled();
  });

  it("should return 404 for non-existent board", async () => {
    mockPrisma.board.findUnique.mockResolvedValue(null);

    const request = new Request("http://localhost/api/boards/future-state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "non-existent-id", generations: 5 }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Board not found");
    expect(mockPrisma.board.update).not.toHaveBeenCalled();
  });

  it("should return 400 for invalid generations (negative)", async () => {
    const request = new Request("http://localhost/api/boards/future-state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "test-id-123", generations: -1 }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation error");
    expect(mockPrisma.board.findUnique).not.toHaveBeenCalled();
  });

  it("should return 400 for invalid generations (zero)", async () => {
    const request = new Request("http://localhost/api/boards/future-state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "test-id-123", generations: 0 }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation error");
    expect(mockPrisma.board.findUnique).not.toHaveBeenCalled();
  });

  it("should return 400 for missing generations", async () => {
    const request = new Request("http://localhost/api/boards/future-state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "test-id-123" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation error");
    expect(mockPrisma.board.findUnique).not.toHaveBeenCalled();
  });

  it("should return 500 for database error", async () => {
    mockPrisma.board.findUnique.mockRejectedValue(new Error("Database error"));

    const request = new Request("http://localhost/api/boards/future-state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "test-id-123", generations: 5 }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal server error");
  });
});
