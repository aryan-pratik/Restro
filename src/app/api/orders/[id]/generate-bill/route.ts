import { NextRequest, NextResponse } from "next/server";
import { generateBill } from "@/lib/actions/billing";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bill = await generateBill(id);
    return NextResponse.json({ success: true, message: "Bill generated successfully", data: bill });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "GENERATE_BILL_ERROR", message: error.message } },
      { status: 400 }
    );
  }
}
