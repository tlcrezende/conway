import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { BoardState } from "@/lib/gameLogic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const board = await prisma.board.findUnique({
      where: { id },
    });

    if (!board) {
      return NextResponse.json(
        { error: "Board not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: board.id,
      state: JSON.parse(board.state) as BoardState,
      createdAt: board.createdAt,
    });
  } catch (error) {
    console.error("Error getting board:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
