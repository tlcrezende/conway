/**
 * @jest-environment node
 */
import { POST } from "@/app/api/boards/upload/route";
import { prisma } from "@/lib/prisma";
import type { BoardState } from "@/lib/gameLogic";

// Mock Prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    board: {
      create: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe("POST /api/boards/upload", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should upload valid board and return 201", async () => {
    const board: BoardState = [
      [0, 1, 0],
      [1, 1, 1],
      [0, 1, 0],
    ];

    const mockBoard = {
      id: "test-id-123",
      state: JSON.stringify(board),
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
    };

    mockPrisma.board.create.mockResolvedValue(mockBoard);

    const request = new Request("http://localhost/api/boards/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ board }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.id).toBe("test-id-123");
    expect(data.state).toEqual(board);
    expect(data.createdAt).toBeDefined();
    expect(mockPrisma.board.create).toHaveBeenCalledWith({
      data: {
        state: JSON.stringify(board),
      },
    });
  });

  it("should return 400 for invalid board (empty)", async () => {
    const request = new Request("http://localhost/api/boards/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ board: [] }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation error");
    expect(mockPrisma.board.create).not.toHaveBeenCalled();
  });

  it("should return 400 for invalid board (inconsistent rows)", async () => {
    const request = new Request("http://localhost/api/boards/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        board: [
          [0, 1],
          [1],
        ],
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation error");
    expect(mockPrisma.board.create).not.toHaveBeenCalled();
  });

  it("should return 400 for missing board field", async () => {
    const request = new Request("http://localhost/api/boards/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation error");
    expect(mockPrisma.board.create).not.toHaveBeenCalled();
  });

  it("should return 500 for database error", async () => {
    const board: BoardState = [
      [0, 1],
      [1, 0],
    ];

    mockPrisma.board.create.mockRejectedValue(new Error("Database error"));

    const request = new Request("http://localhost/api/boards/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ board }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal server error");
  });
});
