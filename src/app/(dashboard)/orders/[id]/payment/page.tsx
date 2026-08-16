import { PrismaClient, PaymentStatus, OrderStatus } from "@prisma/client";
import { notFound } from "next/navigation";
import { PaymentClient } from "./payment-client";

const prisma = new PrismaClient();

export default async function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      bill: true,
      payments: true,
      table: true,
    },
  });

  if (!order || !order.bill) {
    notFound();
  }

  // Calculate remaining due
  const totalPaid = order.payments
    .filter(p => p.status === PaymentStatus.PAID)
    .reduce((sum, p) => sum + p.amount, 0);
    
  const remainingDue = order.bill.grandTotal - totalPaid;
  const isCompleted = order.status === OrderStatus.COMPLETED;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-8">
      <div className="w-full max-w-lg">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Process Payment</h1>
        <p className="text-muted-foreground mb-8">
          Order {order.id.slice(-6).toUpperCase()} • {order.table?.name || "Takeaway"}
        </p>

        <PaymentClient 
          orderId={order.id} 
          grandTotal={order.bill.grandTotal} 
          remainingDue={remainingDue}
          isCompleted={isCompleted}
        />
      </div>
    </div>
  );
}
