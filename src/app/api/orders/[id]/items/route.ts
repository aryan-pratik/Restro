import { NextRequest, NextResponse } from "next/server";
import { addOrderItem } from "@/lib/actions/order";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    await addOrderItem(id, body);
    return NextResponse.json({ success: true, message: "Item added to order" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "ADD_ITEM_ERROR", message: error.message } },
      { status: 400 }
    );
  }
}
