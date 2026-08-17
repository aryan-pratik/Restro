"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Plus, Minus, X, Check, ChefHat, Receipt, Banknote, CreditCard, Smartphone } from "lucide-react";
import { addOrderItem, updateOrderItemQuantity, removeOrderItem, sendKOT } from "@/lib/actions/order";
import { settleAndGenerateBill } from "@/lib/actions/billing";
import { OrderStatus, PaymentMethod } from "@prisma/client";
import Image from "next/image";
import { useRouter } from "next/navigation";

export function POSClient({ table, order, categories, menuItems }: any) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSettleOpen, setIsSettleOpen] = useState(false);
  const [settleMethod, setSettleMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [settleAmountStr, setSettleAmountStr] = useState("");

  // Filter items
  const filteredItems = menuItems.filter((item: any) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "ALL" || item.categoryId === selectedCategory;
    return matchesSearch && matchesCategory && item.isAvailable;
  });

  const handleAddItem = async (menuItemId: string) => {
    try {
      setIsProcessing(true);
      await addOrderItem(order.id, { menuItemId, quantity: 1 });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateQuantity = async (orderItemId: string, currentQty: number, delta: number) => {
    const newQty = currentQty + delta;
    try {
      setIsProcessing(true);
      if (newQty <= 0) {
        await removeOrderItem(orderItemId);
      } else {
        await updateOrderItemQuantity(orderItemId, newQty);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveItem = async (orderItemId: string) => {
    try {
      setIsProcessing(true);
      await removeOrderItem(orderItemId);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendKOT = async () => {
    try {
      setIsProcessing(true);
      await sendKOT(order.id);
      alert("KOT Sent to Kitchen!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const openSettleDialog = () => {
    setSettleMethod(PaymentMethod.CASH);
    setSettleAmountStr(order.grandTotal.toFixed(2));
    setIsSettleOpen(true);
  };

  const handleConfirmSettle = async () => {
    const amount = parseFloat(settleAmountStr) || 0;
    if (amount <= 0) {
      alert("Please enter a valid settlement amount.");
      return;
    }

    try {
      setIsProcessing(true);
      await settleAndGenerateBill(order.id, amount, settleMethod);
      setIsSettleOpen(false);
      router.push(`/orders/${order.id}/bill`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex w-full h-full">
      {/* Left Pane: Menu Grid */}
      <div className="flex-1 flex flex-col border-r bg-white h-full overflow-hidden">
        {/* Top Bar */}
        <div className="p-4 border-b flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search menu items..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Categories Sidebar */}
          <div className="w-48 border-r overflow-y-auto p-4 flex flex-col gap-2 bg-slate-50/50">
            <Button 
              variant={selectedCategory === "ALL" ? "default" : "ghost"}
              onClick={() => setSelectedCategory("ALL")}
              className="justify-start"
            >
              All Items
            </Button>
            {categories.map((cat: any) => (
              <Button 
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "ghost"}
                onClick={() => setSelectedCategory(cat.id)}
                className="justify-start"
              >
                {cat.name}
              </Button>
            ))}
          </div>

          {/* Items Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredItems.map((item: any) => (
                <Card 
                  key={item.id} 
                  className={`cursor-pointer hover:bg-slate-50 hover:shadow-sm transition-all overflow-hidden border-l-4 ${item.isVeg ? 'border-l-green-500' : 'border-l-red-500'}`}
                  onClick={() => handleAddItem(item.id)}
                >
                  <CardContent className="p-3 pl-4 flex items-center justify-between h-full gap-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-sm leading-tight">{item.name}</h3>
                    </div>
                    <div className="font-bold text-primary whitespace-nowrap shrink-0">₹{item.price.toFixed(2)}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane: Cart */}
      <div className="w-[400px] flex flex-col bg-white h-full border-l">
        <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
          <div>
            <h2 className="font-bold text-xl">{table.name}</h2>
            <p className="text-xs text-muted-foreground font-mono">Order: {order.id.slice(-6).toUpperCase()}</p>
          </div>
          <div className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-bold">
            {order.status}
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {order.items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
              <Receipt className="h-12 w-12 opacity-20" />
              <p>Cart is empty</p>
            </div>
          ) : (
            order.items.map((item: any) => (
              <div key={item.id} className="flex flex-col gap-2 p-3 bg-slate-50 rounded-lg border">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{item.menuItem.name}</h4>
                    <div className="text-xs text-muted-foreground">₹{item.unitPrice.toFixed(2)}</div>
                  </div>
                  <div className="font-bold text-sm">
                    ₹{(item.unitPrice * item.quantity).toFixed(2)}
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleRemoveItem(item.id)} disabled={isProcessing}>
                    <X className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex items-center gap-3 bg-white border rounded-md px-1 py-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)} disabled={isProcessing}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-4 text-center text-sm font-medium">{item.quantity}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)} disabled={isProcessing}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Order Summary & Actions */}
        <div className="border-t bg-slate-50 p-4 space-y-4">
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>₹{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Taxes</span>
              <span>₹{order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
              <span>Total</span>
              <span>₹{order.grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button 
              variant="outline" 
              className="w-full h-12"
              disabled={isProcessing || order.items.length === 0}
            >
              <Check className="mr-2 h-4 w-4" /> Save
            </Button>
            <Button 
              className="w-full h-12 bg-amber-600 hover:bg-amber-700 text-white"
              onClick={handleSendKOT}
              disabled={isProcessing || order.items.length === 0 || order.status === OrderStatus.KOT_SENT}
            >
              <ChefHat className="mr-2 h-4 w-4" /> Send KOT
            </Button>
          </div>
          <Button
            variant="default"
            className="w-full h-12 bg-green-600 hover:bg-green-700"
            disabled={isProcessing || order.items.length === 0}
            onClick={openSettleDialog}
          >
            <Receipt className="mr-2 h-4 w-4" /> Settle & Generate Bill
          </Button>
        </div>
      </div>

      {/* Settle Payment Dialog */}
      <Dialog open={isSettleOpen} onOpenChange={setIsSettleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settle Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-2">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Total Due</div>
              <div className="text-4xl font-bold">₹{order.grandTotal.toFixed(2)}</div>
            </div>

            <div>
              <Label className="text-sm font-semibold mb-2 block">Payment Method</Label>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  type="button"
                  variant={settleMethod === PaymentMethod.CASH ? "default" : "outline"}
                  className={`h-20 flex flex-col gap-2 ${settleMethod === PaymentMethod.CASH ? "bg-blue-600" : ""}`}
                  onClick={() => setSettleMethod(PaymentMethod.CASH)}
                >
                  <Banknote className="w-6 h-6" />
                  <span className="text-xs">Cash</span>
                </Button>
                <Button
                  type="button"
                  variant={settleMethod === PaymentMethod.CARD ? "default" : "outline"}
                  className={`h-20 flex flex-col gap-2 ${settleMethod === PaymentMethod.CARD ? "bg-blue-600" : ""}`}
                  onClick={() => setSettleMethod(PaymentMethod.CARD)}
                >
                  <CreditCard className="w-6 h-6" />
                  <span className="text-xs">Card</span>
                </Button>
                <Button
                  type="button"
                  variant={settleMethod === PaymentMethod.UPI ? "default" : "outline"}
                  className={`h-20 flex flex-col gap-2 ${settleMethod === PaymentMethod.UPI ? "bg-blue-600" : ""}`}
                  onClick={() => setSettleMethod(PaymentMethod.UPI)}
                >
                  <Smartphone className="w-6 h-6" />
                  <span className="text-xs">UPI</span>
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="settleAmount" className="text-sm font-semibold mb-2 block">Settlement Amount (₹)</Label>
              <Input
                id="settleAmount"
                type="number"
                className="text-xl h-12 font-semibold px-4"
                value={settleAmountStr}
                onChange={(e) => setSettleAmountStr(e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1 h-12" onClick={() => setIsSettleOpen(false)} disabled={isProcessing}>
                Cancel
              </Button>
              <Button
                className="flex-[2] h-12 bg-green-600 hover:bg-green-700"
                onClick={handleConfirmSettle}
                disabled={isProcessing || (parseFloat(settleAmountStr) || 0) <= 0}
              >
                Confirm & Generate Bill
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
