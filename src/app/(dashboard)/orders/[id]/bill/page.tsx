import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import { BillClientActions } from "./bill-client-actions";

const prisma = new PrismaClient();

export default async function BillPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      outlet: true,
      table: true,
      bill: true,
      items: {
        include: { menuItem: true },
      },
    },
  });

  if (!order || !order.bill) {
    notFound();
  }

  const { outlet, bill, items } = order;

  return (
    <div className="min-h-screen bg-slate-100 p-8 flex justify-center">
      <div className="w-full max-w-md">
        
        {/* Receipt Container */}
        <div className="bg-white p-6 shadow-sm border border-slate-200">
          {/* Header */}
          <div className="text-center mb-6 border-b border-dashed pb-4">
            <h1 className="text-2xl font-bold uppercase tracking-widest mb-1">{outlet.name}</h1>
            <div className="mt-4 text-sm flex justify-between font-mono text-slate-500">
              <span>Date: {bill.createdAt.toLocaleDateString()}</span>
              <span>Time: {bill.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="text-sm flex justify-between font-mono text-slate-500 mt-1">
              <span>Order: {order.id.slice(-6).toUpperCase()}</span>
              <span>Table: {order.table?.name || "Takeaway"}</span>
            </div>
          </div>

          {/* Items */}
          <div className="mb-6 border-b border-dashed pb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dashed text-left">
                  <th className="py-2 w-12">Qty</th>
                  <th className="py-2">Item</th>
                  <th className="py-2 text-right">Amt</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2 align-top">{item.quantity}</td>
                    <td className="py-2 pr-2">{item.menuItem.name}</td>
                    <td className="py-2 text-right align-top">{(item.unitPrice * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>{bill.subtotal.toFixed(2)}</span>
            </div>
            {bill.discount > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Discount</span>
                <span>-{bill.discount.toFixed(2)}</span>
              </div>
            )}
            {bill.tax > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Taxes</span>
                <span>{bill.tax.toFixed(2)}</span>
              </div>
            )}
            {bill.serviceCharge > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Service Charge</span>
                <span>{bill.serviceCharge.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-2 mt-2 border-t border-dashed">
              <span>GRAND TOTAL</span>
              <span>₹{bill.grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-8 text-center text-xs text-slate-500 uppercase tracking-wider">
            Thank you for visiting!
          </div>
        </div>

        {/* Actions */}
        <BillClientActions orderId={order.id} />
      </div>
    </div>
  );
}
