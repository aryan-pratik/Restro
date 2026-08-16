import { NextRequest, NextResponse } from "next/server";
import { updateOrderItemQuantity, removeOrderItem } from "@/lib/actions/order";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string, itemId: string }> }
) {
  try {
    const { itemId } = await params;
    const body = await request.json();
    await updateOrderItemQuantity(itemId, body.quantity);
    return NextResponse.json({ success: true, message: "Item quantity updated" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "UPDATE_ITEM_ERROR", message: error.message } },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string, itemId: string }> }
) {
  try {
    const { itemId } = await params;
    await removeOrderItem(itemId);
    return NextResponse.json({ success: true, message: "Item removed from order" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "DELETE_ITEM_ERROR", message: error.message } },
      { status: 400 }
    );
  }
}
