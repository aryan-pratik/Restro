import { NextRequest, NextResponse } from "next/server";
import { openTableSession } from "@/lib/actions/table";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await openTableSession(id);
    return NextResponse.json({ success: true, message: "Table session opened" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "OPEN_SESSION_ERROR", message: error.message } },
      { status: 400 }
    );
  }
}
