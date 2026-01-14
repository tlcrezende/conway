import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadBoardSchema } from "@/lib/validations";
import type { BoardState } from "@/lib/gameLogic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = uploadBoardSchema.parse(body);

    // Save board to database
    const board = await prisma.board.create({
      data: {
        state: JSON.stringify(validatedData.board),
      },
    });

    return NextResponse.json(
      {
        id: board.id,
        state: JSON.parse(board.state) as BoardState,
        createdAt: board.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.message },
        { status: 400 }
      );
    }

    console.error("Error uploading board:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
