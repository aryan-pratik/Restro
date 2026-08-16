import { NextRequest, NextResponse } from "next/server";
import { getKOTById } from "@/lib/actions/kot";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const kot = await getKOTById(id);
    if (!kot) {
      return NextResponse.json(
        { success: false, error: { code: "KOT_NOT_FOUND", message: "KOT not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: kot });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
