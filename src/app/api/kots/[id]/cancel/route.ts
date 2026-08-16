import { NextRequest, NextResponse } from "next/server";
import { updateKOTStatus } from "@/lib/actions/kot";
import { KOTStatus } from "@prisma/client";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await updateKOTStatus(id, KOTStatus.CANCELLED);
    return NextResponse.json({ success: true, message: "KOT Cancelled" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "UPDATE_KOT_ERROR", message: error.message } },
      { status: 400 }
    );
  }
}
