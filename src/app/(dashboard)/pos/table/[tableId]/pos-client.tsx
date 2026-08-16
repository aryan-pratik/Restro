"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Plus, Minus, X, Check, ChefHat, Receipt } from "lucide-react";
import { addOrderItem, updateOrderItemQuantity, removeOrderItem, sendKOT } from "@/lib/actions/order";
import { generateBill } from "@/lib/actions/billing";
import { OrderStatus } from "@prisma/client";
import Image from "next/image";
import { useRouter } from "next/navigation";

export function POSClient({ table, order, categories, menuItems }: any) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleGenerateBill = async () => {
    try {
      setIsProcessing(true);
      await generateBill(order.id);
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

        {/* Categories Bar */}
        <div className="p-4 border-b flex gap-2 overflow-x-auto whitespace-nowrap hide-scrollbar">
          <Button 
            variant={selectedCategory === "ALL" ? "default" : "outline"}
            onClick={() => setSelectedCategory("ALL")}
            className="rounded-full"
          >
            All Items
          </Button>
          {categories.map((cat: any) => (
            <Button 
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat.id)}
              className="rounded-full"
            >
              {cat.name}
            </Button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((item: any) => (
              <Card 
                key={item.id} 
                className="cursor-pointer hover:border-primary hover:shadow-md transition-all overflow-hidden flex flex-col"
                onClick={() => handleAddItem(item.id)}
              >
                {item.imageUrl ? (
                  <div className="h-32 w-full relative bg-slate-100">
                    <Image src={item.imageUrl} alt={item.name} layout="fill" objectFit="cover" />
                  </div>
                ) : (
                  <div className="h-32 w-full bg-slate-100 flex items-center justify-center text-muted-foreground">
                    No Image
                  </div>
                )}
                <CardContent className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-3 h-3 rounded-full border ${item.isVeg ? 'border-green-600 bg-green-100' : 'border-red-600 bg-red-100'}`} />
                      <h3 className="font-semibold text-sm leading-tight line-clamp-2">{item.name}</h3>
                    </div>
                  </div>
                  <div className="font-bold mt-2 text-primary">₹{item.price.toFixed(2)}</div>
                </CardContent>
              </Card>
            ))}
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
            onClick={handleGenerateBill}
          >
            <Receipt className="mr-2 h-4 w-4" /> Generate Bill
          </Button>
        </div>
      </div>
    </div>
  );
}
