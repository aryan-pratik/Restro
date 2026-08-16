"use client";

import { Button } from "@/components/ui/button";
import { Printer, CreditCard } from "lucide-react";
import Link from "next/link";

export function BillClientActions({ orderId }: { orderId: string }) {
  return (
    <div className="mt-6 flex gap-4">
      <Button variant="outline" className="flex-1 bg-white" onClick={() => window.print()}>
        <Printer className="mr-2 h-4 w-4" /> Print Bill
      </Button>
      <Link href={`/orders/${orderId}/payment`} className="flex-1">
        <Button className="w-full bg-blue-600 hover:bg-blue-700">
          <CreditCard className="mr-2 h-4 w-4" /> Payment
        </Button>
      </Link>
    </div>
  );
}
