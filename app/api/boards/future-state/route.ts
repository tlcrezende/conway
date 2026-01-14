import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getFutureStateSchema } from "@/lib/validations";
import { getFutureState, type BoardState } from "@/lib/gameLogic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, generations } = getFutureStateSchema.parse(body);

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

    // Calculate future state
    const futureState = getFutureState(currentState, generations);

    // Update database
    const updatedBoard = await prisma.board.update({
      where: { id },
      data: {
        state: JSON.stringify(futureState),
      },
    });

    return NextResponse.json({
      id: updatedBoard.id,
      state: futureState,
      generations,
      createdAt: updatedBoard.createdAt,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.message },
        { status: 400 }
      );
    }

    console.error("Error getting future state:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
