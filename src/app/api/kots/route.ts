import { NextRequest, NextResponse } from "next/server";
import { getActiveKOTs } from "@/lib/actions/kot";

export async function GET() {
  try {
    const kots = await getActiveKOTs();
    return NextResponse.json({ success: true, data: kots });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "FETCH_KOTS_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
