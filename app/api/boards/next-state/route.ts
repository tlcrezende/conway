import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getNextStateSchema } from "@/lib/validations";
import { getNextGeneration, type BoardState } from "@/lib/gameLogic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = getNextStateSchema.parse(body);

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

    // Calculate next generation
    const nextState = getNextGeneration(currentState);

    // Update database
    const updatedBoard = await prisma.board.update({
      where: { id },
      data: {
        state: JSON.stringify(nextState),
      },
    });

    return NextResponse.json({
      id: updatedBoard.id,
      state: nextState,
      createdAt: updatedBoard.createdAt,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.message },
        { status: 400 }
      );
    }

    console.error("Error getting next state:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
