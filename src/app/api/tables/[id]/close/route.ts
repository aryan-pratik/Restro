import { NextRequest, NextResponse } from "next/server";
import { closeTableSession } from "@/lib/actions/table";
import { TableStatus } from "@prisma/client";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const nextStatus = body.nextStatus || TableStatus.CLEANING;
    await closeTableSession(id, nextStatus);
    return NextResponse.json({ success: true, message: "Table session closed" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "CLOSE_SESSION_ERROR", message: error.message } },
      { status: 400 }
    );
  }
}
