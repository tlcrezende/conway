import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getFinalStateSchema } from "@/lib/validations";
import { getFinalState, type BoardState } from "@/lib/gameLogic";
import { CONFIG } from "@/lib/config";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = getFinalStateSchema.parse(body);

    // Get current board from database
    const boardRecord = await prisma.board.findUnique({
      where: { id },
    });

    if (!boardRecord) {
      return NextResponse.json(
        { error: "Board not found" },
        { status: 404 }
      );
    }

    // Parse current state
    const currentState = JSON.parse(boardRecord.state) as BoardState;

    try {
      // Find final state
      const { state: finalState, generations } = getFinalState(
        currentState,
        CONFIG.MAX_ITERATIONS
      );

      // Update database with final state
      const updatedBoard = await prisma.board.update({
        where: { id },
        data: {
          state: JSON.stringify(finalState),
        },
      });

      return NextResponse.json({
        id: updatedBoard.id,
        state: finalState,
        generations,
        createdAt: updatedBoard.createdAt,
      });
    } catch (error) {
      // Board did not converge
      if (
        error instanceof Error &&
        error.message.includes("did not converge")
      ) {
        return NextResponse.json(
          {
            error: "Board did not converge",
            message: `The board did not stabilize within ${CONFIG.MAX_ITERATIONS} iterations`,
          },
          { status: 422 }
        );
      }
      throw error;
    }
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.message },
        { status: 400 }
      );
    }

    console.error("Error getting final state:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
