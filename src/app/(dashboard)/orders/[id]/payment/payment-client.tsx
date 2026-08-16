"use client";

import { useState } from "react";
import { PaymentMethod } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { processPayment } from "@/lib/actions/payment";
import { Banknote, CreditCard, Smartphone, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function PaymentClient({ 
  orderId, 
  grandTotal, 
  remainingDue, 
  isCompleted 
}: { 
  orderId: string; 
  grandTotal: number; 
  remainingDue: number;
  isCompleted: boolean;
}) {
  const router = useRouter();
  const [method, setMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [amountStr, setAmountStr] = useState(remainingDue.toString());
  const [isProcessing, setIsProcessing] = useState(false);

  const amountEntered = parseFloat(amountStr) || 0;
  const changeDue = amountEntered > remainingDue ? amountEntered - remainingDue : 0;

  const handleConfirm = async () => {
    if (amountEntered <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    try {
      setIsProcessing(true);
      await processPayment(orderId, amountEntered, method);
      router.refresh();
    } catch (err: any) {
      alert(err.message);
      setIsProcessing(false);
    }
  };

  if (isCompleted || remainingDue <= 0) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6 flex flex-col items-center justify-center text-center">
          <CheckCircle2 className="w-16 h-16 text-green-600 mb-4" />
          <h2 className="text-2xl font-bold text-green-800 mb-2">Payment Complete!</h2>
          <p className="text-green-700 mb-6">The order has been fully paid and the table is released.</p>
          
          <div className="flex gap-4 w-full">
            <Link href={`/orders/${orderId}/bill`} className="flex-1">
              <Button variant="outline" className="w-full bg-white text-green-800 border-green-300 hover:bg-green-100">
                View Receipt
              </Button>
            </Link>
            <Link href="/pos" className="flex-1">
              <Button className="w-full bg-green-600 hover:bg-green-700">
                New Order
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 overflow-hidden">
      <div className="bg-slate-900 text-white p-6 text-center">
        <div className="text-sm font-medium text-slate-400 mb-1">AMOUNT DUE</div>
        <div className="text-5xl font-bold">₹{remainingDue.toFixed(2)}</div>
      </div>
      
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Payment Methods */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Payment Method</Label>
            <div className="grid grid-cols-3 gap-3">
              <Button 
                variant={method === PaymentMethod.CASH ? "default" : "outline"} 
                className={`h-24 flex flex-col gap-2 ${method === PaymentMethod.CASH ? 'bg-blue-600' : ''}`}
                onClick={() => setMethod(PaymentMethod.CASH)}
              >
                <Banknote className="w-8 h-8" />
                <span>Cash</span>
              </Button>
              <Button 
                variant={method === PaymentMethod.CARD ? "default" : "outline"} 
                className={`h-24 flex flex-col gap-2 ${method === PaymentMethod.CARD ? 'bg-blue-600' : ''}`}
                onClick={() => setMethod(PaymentMethod.CARD)}
              >
                <CreditCard className="w-8 h-8" />
                <span>Card</span>
              </Button>
              <Button 
                variant={method === PaymentMethod.UPI ? "default" : "outline"} 
                className={`h-24 flex flex-col gap-2 ${method === PaymentMethod.UPI ? 'bg-blue-600' : ''}`}
                onClick={() => setMethod(PaymentMethod.UPI)}
              >
                <Smartphone className="w-8 h-8" />
                <span>UPI</span>
              </Button>
            </div>
          </div>

          {/* Amount Input (Particularly useful for Cash changes) */}
          {method === PaymentMethod.CASH && (
            <div className="pt-4 border-t">
              <Label className="text-base font-semibold mb-2 block">Amount Received (₹)</Label>
              <Input 
                type="number" 
                className="text-2xl h-14 font-semibold px-4"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
              />
              
              {changeDue > 0 && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex justify-between items-center text-amber-900">
                  <span className="font-semibold">Change to Return:</span>
                  <span className="text-xl font-bold">₹{changeDue.toFixed(2)}</span>
                </div>
              )}
            </div>
          )}

          <div className="pt-6 border-t flex gap-4">
            <Link href={`/orders/${orderId}/bill`} className="flex-1">
              <Button variant="outline" className="w-full h-14" disabled={isProcessing}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            </Link>
            <Button 
              className="flex-[2] h-14 text-lg bg-green-600 hover:bg-green-700" 
              onClick={handleConfirm}
              disabled={isProcessing || amountEntered <= 0}
            >
              Confirm Payment
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
