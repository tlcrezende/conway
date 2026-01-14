import {
  boardSchema,
  uploadBoardSchema,
  getNextStateSchema,
  getFutureStateSchema,
  getFinalStateSchema,
} from "@/lib/validations";
import { CONFIG } from "@/lib/config";

describe("validations", () => {
  describe("boardSchema", () => {
    it("should accept valid board", () => {
      const board = [
        [0, 1, 0],
        [1, 1, 1],
        [0, 1, 0],
      ];
      expect(() => boardSchema.parse(board)).not.toThrow();
      const result = boardSchema.parse(board);
      expect(result).toEqual(board);
    });

    it("should accept board with all zeros", () => {
      const board = [
        [0, 0],
        [0, 0],
      ];
      expect(() => boardSchema.parse(board)).not.toThrow();
    });

    it("should accept board with all ones", () => {
      const board = [
        [1, 1],
        [1, 1],
      ];
      expect(() => boardSchema.parse(board)).not.toThrow();
    });

    it("should accept board at maximum size", () => {
      const board = Array(CONFIG.MAX_BOARD_SIZE)
        .fill(null)
        .map(() => Array(CONFIG.MAX_BOARD_SIZE).fill(0));
      expect(() => boardSchema.parse(board)).not.toThrow();
    });

    it("should reject empty board", () => {
      const board: number[][] = [];
      expect(() => boardSchema.parse(board)).toThrow();
    });

    it("should reject board with empty row", () => {
      const board = [[]];
      expect(() => boardSchema.parse(board)).toThrow();
    });

    it("should reject board with inconsistent row lengths", () => {
      const board = [
        [0, 1],
        [1],
      ];
      expect(() => boardSchema.parse(board)).toThrow(
        "Board must be a non-empty 2D array with consistent row lengths"
      );
    });

    it("should reject board with values other than 0 or 1", () => {
      const board = [
        [0, 1],
        [2, 0],
      ];
      expect(() => boardSchema.parse(board)).toThrow();
    });

    it("should reject board exceeding MAX_BOARD_SIZE", () => {
      const board = Array(CONFIG.MAX_BOARD_SIZE + 1)
        .fill(null)
        .map(() => Array(CONFIG.MAX_BOARD_SIZE).fill(0));
      expect(() => boardSchema.parse(board)).toThrow(
        `Board dimensions must not exceed ${CONFIG.MAX_BOARD_SIZE}x${CONFIG.MAX_BOARD_SIZE}`
      );
    });

    it("should reject board with columns exceeding MAX_BOARD_SIZE", () => {
      const board = Array(10)
        .fill(null)
        .map(() => Array(CONFIG.MAX_BOARD_SIZE + 1).fill(0));
      expect(() => boardSchema.parse(board)).toThrow(
        `Board dimensions must not exceed ${CONFIG.MAX_BOARD_SIZE}x${CONFIG.MAX_BOARD_SIZE}`
      );
    });

    it("should reject board with negative numbers", () => {
      const board = [
        [0, -1],
        [1, 0],
      ];
      expect(() => boardSchema.parse(board)).toThrow();
    });

    it("should reject board with decimal numbers", () => {
      const board = [
        [0, 0.5],
        [1, 0],
      ];
      expect(() => boardSchema.parse(board)).toThrow();
    });

    it("should reject non-array input", () => {
      expect(() => boardSchema.parse("not an array")).toThrow();
      expect(() => boardSchema.parse(123)).toThrow();
      expect(() => boardSchema.parse(null)).toThrow();
      expect(() => boardSchema.parse({})).toThrow();
    });

    it("should reject array with non-array rows", () => {
      const board = [1, 2, 3] as any;
      expect(() => boardSchema.parse(board)).toThrow();
    });
  });

  describe("uploadBoardSchema", () => {
    it("should accept valid upload request", () => {
      const request = {
        board: [
          [0, 1],
          [1, 0],
        ],
      };
      expect(() => uploadBoardSchema.parse(request)).not.toThrow();
      const result = uploadBoardSchema.parse(request);
      expect(result.board).toEqual(request.board);
    });

    it("should reject request without board", () => {
      const request = {};
      expect(() => uploadBoardSchema.parse(request)).toThrow();
    });

    it("should reject request with invalid board", () => {
      const request = {
        board: [],
      };
      expect(() => uploadBoardSchema.parse(request)).toThrow();
    });

    it("should reject request with non-array board", () => {
      const request = {
        board: "not an array",
      };
      expect(() => uploadBoardSchema.parse(request)).toThrow();
    });

    it("should reject request with extra fields (should still validate board)", () => {
      const request = {
        board: [
          [0, 1],
          [1, 0],
        ],
        extra: "field",
      };
      // Zod by default allows extra fields, but we can check the parsed result
      const result = uploadBoardSchema.parse(request);
      expect(result.board).toBeDefined();
      expect((result as any).extra).toBeUndefined();
    });
  });

  describe("getNextStateSchema", () => {
    it("should accept valid request with id", () => {
      const request = {
        id: "clx123456789",
      };
      expect(() => getNextStateSchema.parse(request)).not.toThrow();
      const result = getNextStateSchema.parse(request);
      expect(result.id).toBe("clx123456789");
    });

    it("should reject request without id", () => {
      const request = {};
      expect(() => getNextStateSchema.parse(request)).toThrow();
    });

    it("should reject request with empty id", () => {
      const request = {
        id: "",
      };
      expect(() => getNextStateSchema.parse(request)).toThrow("ID is required");
    });

    it("should reject request with non-string id", () => {
      const request = {
        id: 123,
      };
      expect(() => getNextStateSchema.parse(request)).toThrow();
    });

    it("should accept id with various formats", () => {
      const validIds = ["clx123", "abc", "123", "id-with-dashes"];
      validIds.forEach((id) => {
        expect(() =>
          getNextStateSchema.parse({ id })
        ).not.toThrow();
      });
    });
  });

  describe("getFutureStateSchema", () => {
    it("should accept valid request with id and generations", () => {
      const request = {
        id: "clx123456789",
        generations: 10,
      };
      expect(() => getFutureStateSchema.parse(request)).not.toThrow();
      const result = getFutureStateSchema.parse(request);
      expect(result.id).toBe("clx123456789");
      expect(result.generations).toBe(10);
    });

    it("should accept generations at maximum", () => {
      const request = {
        id: "clx123456789",
        generations: CONFIG.MAX_GENERATIONS,
      };
      expect(() => getFutureStateSchema.parse(request)).not.toThrow();
    });

    it("should reject request without id", () => {
      const request = {
        generations: 10,
      };
      expect(() => getFutureStateSchema.parse(request)).toThrow();
    });

    it("should reject request without generations", () => {
      const request = {
        id: "clx123456789",
      };
      expect(() => getFutureStateSchema.parse(request)).toThrow();
    });

    it("should reject request with negative generations", () => {
      const request = {
        id: "clx123456789",
        generations: -1,
      };
      expect(() => getFutureStateSchema.parse(request)).toThrow();
    });

    it("should reject request with zero generations", () => {
      const request = {
        id: "clx123456789",
        generations: 0,
      };
      expect(() => getFutureStateSchema.parse(request)).toThrow();
    });

    it("should reject request with generations exceeding MAX_GENERATIONS", () => {
      const request = {
        id: "clx123456789",
        generations: CONFIG.MAX_GENERATIONS + 1,
      };
      expect(() => getFutureStateSchema.parse(request)).toThrow(
        `Maximum ${CONFIG.MAX_GENERATIONS} generations allowed`
      );
    });

    it("should reject request with non-integer generations", () => {
      const request = {
        id: "clx123456789",
        generations: 10.5,
      };
      expect(() => getFutureStateSchema.parse(request)).toThrow();
    });

    it("should reject request with non-number generations", () => {
      const request = {
        id: "clx123456789",
        generations: "10",
      };
      expect(() => getFutureStateSchema.parse(request)).toThrow();
    });
  });

  describe("getFinalStateSchema", () => {
    it("should accept valid request with id", () => {
      const request = {
        id: "clx123456789",
      };
      expect(() => getFinalStateSchema.parse(request)).not.toThrow();
      const result = getFinalStateSchema.parse(request);
      expect(result.id).toBe("clx123456789");
    });

    it("should reject request without id", () => {
      const request = {};
      expect(() => getFinalStateSchema.parse(request)).toThrow();
    });

    it("should reject request with empty id", () => {
      const request = {
        id: "",
      };
      expect(() => getFinalStateSchema.parse(request)).toThrow("ID is required");
    });

    it("should reject request with non-string id", () => {
      const request = {
        id: 123,
      };
      expect(() => getFinalStateSchema.parse(request)).toThrow();
    });
  });
});
