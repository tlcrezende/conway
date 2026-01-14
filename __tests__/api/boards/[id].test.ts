/**
 * @jest-environment node
 */
import { GET } from "@/app/api/boards/[id]/route";
import { prisma } from "@/lib/prisma";
import type { BoardState } from "@/lib/gameLogic";

// Mock Prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    board: {
      findUnique: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe("GET /api/boards/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return board by id", async () => {
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

    mockPrisma.board.findUnique.mockResolvedValue(mockBoard);

    const request = new Request("http://localhost/api/boards/test-id-123");
    const params = Promise.resolve({ id: "test-id-123" });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe("test-id-123");
    expect(data.state).toEqual(board);
    expect(data.createdAt).toBeDefined();
    expect(mockPrisma.board.findUnique).toHaveBeenCalledWith({
      where: { id: "test-id-123" },
    });
  });

  it("should return 404 for non-existent board", async () => {
    mockPrisma.board.findUnique.mockResolvedValue(null);

    const request = new Request("http://localhost/api/boards/non-existent-id");
    const params = Promise.resolve({ id: "non-existent-id" });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Board not found");
  });

  it("should return 500 for database error", async () => {
    mockPrisma.board.findUnique.mockRejectedValue(new Error("Database error"));

    const request = new Request("http://localhost/api/boards/test-id-123");
    const params = Promise.resolve({ id: "test-id-123" });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal server error");
  });
});
