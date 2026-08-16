import { NextRequest, NextResponse } from "next/server";
import { getOrCreateActiveOrder } from "@/lib/actions/order";
import { CreateOrderSchema } from "@/lib/validations/order";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = CreateOrderSchema.parse(body);
    
    if (!parsed.tableId) {
      return NextResponse.json({ success: false, error: { message: "tableId is required to create order" } }, { status: 400 });
    }

    const order = await getOrCreateActiveOrder(parsed.tableId);
    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "ORDER_CREATE_ERROR", message: error.message } },
      { status: 400 }
    );
  }
}
