import { NextRequest, NextResponse } from "next/server";
import { processPayment } from "@/lib/actions/payment";
import { PaymentMethod } from "@prisma/client";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const { amount, method } = body;

    if (!amount || typeof amount !== 'number') {
      return NextResponse.json({ success: false, error: { message: "Valid amount is required" } }, { status: 400 });
    }
    if (!method || !Object.values(PaymentMethod).includes(method as PaymentMethod)) {
      return NextResponse.json({ success: false, error: { message: "Valid payment method is required" } }, { status: 400 });
    }

    const payment = await processPayment(id, amount, method as PaymentMethod);
    return NextResponse.json({ success: true, message: "Payment processed successfully", data: payment });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "PROCESS_PAYMENT_ERROR", message: error.message } },
      { status: 400 }
    );
  }
}
