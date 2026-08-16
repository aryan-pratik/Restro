import { NextRequest, NextResponse } from "next/server";
import { sendKOT } from "@/lib/actions/order";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const kot = await sendKOT(id);
    return NextResponse.json({ success: true, message: "KOT sent successfully", data: kot });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "SEND_KOT_ERROR", message: error.message } },
      { status: 400 }
    );
  }
}
