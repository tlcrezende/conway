/**
 * @jest-environment node
 */
import { GET } from "@/app/api/boards/route";
import { prisma } from "@/lib/prisma";

// Mock Prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    board: {
      findMany: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe("GET /api/boards", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return list of boards", async () => {
    const mockBoards = [
      {
        id: "test-id-1",
        createdAt: new Date("2024-01-02T00:00:00.000Z"),
      },
      {
        id: "test-id-2",
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
      },
    ];

    mockPrisma.board.findMany.mockResolvedValue(mockBoards);

    const request = new Request("http://localhost/api/boards");

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(2);
    expect(data[0].id).toBe("test-id-1");
    expect(data[1].id).toBe("test-id-2");
    expect(mockPrisma.board.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  });

  it("should return empty array when no boards exist", async () => {
    mockPrisma.board.findMany.mockResolvedValue([]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(0);
  });

  it("should return 500 for database error", async () => {
    mockPrisma.board.findMany.mockRejectedValue(new Error("Database error"));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal server error");
  });
});
