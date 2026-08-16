"use client";

import { useState } from "react";
import { KOTStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, ChefHat, CheckCircle2, Play } from "lucide-react";
import { updateKOTStatus } from "@/lib/actions/kot";

// Utility to format time elapsed
function getTimeElapsed(createdAt: Date) {
  const diff = Math.floor((new Date().getTime() - new Date(createdAt).getTime()) / 60000);
  if (diff < 1) return "Just now";
  return `${diff} min ago`;
}

function getStatusBadge(status: KOTStatus) {
  switch (status) {
    case KOTStatus.PENDING:
      return "bg-slate-100 text-slate-800 border-slate-300";
    case KOTStatus.ACCEPTED:
      return "bg-blue-100 text-blue-800 border-blue-300";
    case KOTStatus.PREPARING:
      return "bg-amber-100 text-amber-800 border-amber-300";
    case KOTStatus.READY:
      return "bg-green-100 text-green-800 border-green-300";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function KitchenClient({ initialData }: { initialData: any[] }) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStatusChange = async (id: string, status: KOTStatus) => {
    try {
      setIsProcessing(true);
      await updateKOTStatus(id, status);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
      {initialData.length === 0 ? (
        <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg bg-slate-50">
          <ChefHat className="w-12 h-12 mx-auto opacity-20 mb-4" />
          <p className="text-lg">No active KOTs in the kitchen.</p>
        </div>
      ) : (
        initialData.map((kot) => (
          <Card key={kot.id} className="overflow-hidden border-2 shadow-sm flex flex-col">
            <CardHeader className="bg-slate-50 border-b p-4 pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl font-bold">
                    {kot.order.table?.name || "Takeaway"}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground font-mono mt-1">
                    Order: {kot.order.id.slice(-6).toUpperCase()}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(kot.status)}`}>
                  {kot.status}
                </span>
              </div>
              <div className="flex items-center text-xs font-semibold text-red-600 mt-2 bg-red-50 p-1.5 rounded-md inline-flex w-fit">
                <Clock className="w-3 h-3 mr-1" />
                {getTimeElapsed(kot.createdAt)}
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col">
              <div className="p-4 flex-1">
                <ul className="space-y-3">
                  {kot.items.map((item: any, idx: number) => (
                    <li key={idx} className="flex gap-3 items-start border-b pb-3 last:border-0 last:pb-0">
                      <div className="font-bold text-lg leading-none bg-slate-100 rounded w-8 h-8 flex items-center justify-center">
                        {item.quantity}x
                      </div>
                      <div>
                        <div className="font-semibold">{item.menuItem.name}</div>
                        {item.notes && (
                          <div className="text-sm text-amber-700 mt-0.5 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Note: {item.notes}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4 border-t bg-slate-50 mt-auto">
                {kot.status === KOTStatus.PENDING && (
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700" 
                    disabled={isProcessing}
                    onClick={() => handleStatusChange(kot.id, KOTStatus.ACCEPTED)}
                  >
                    Accept Order
                  </Button>
                )}
                {kot.status === KOTStatus.ACCEPTED && (
                  <Button 
                    className="w-full bg-amber-600 hover:bg-amber-700" 
                    disabled={isProcessing}
                    onClick={() => handleStatusChange(kot.id, KOTStatus.PREPARING)}
                  >
                    <Play className="w-4 h-4 mr-2" /> Start Preparing
                  </Button>
                )}
                {kot.status === KOTStatus.PREPARING && (
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700" 
                    disabled={isProcessing}
                    onClick={() => handleStatusChange(kot.id, KOTStatus.READY)}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Mark Ready
                  </Button>
                )}
                {kot.status === KOTStatus.READY && (
                  <Button 
                    variant="outline"
                    className="w-full border-green-600 text-green-700 hover:bg-green-50" 
                    disabled={isProcessing}
                    onClick={() => handleStatusChange(kot.id, KOTStatus.COMPLETED)}
                  >
                    Clear from Board (Completed)
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
