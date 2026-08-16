import { getOrCreateActiveOrder } from "@/lib/actions/order";
import { getCategories, getMenuItems } from "@/lib/actions/menu";
import { getTableById } from "@/lib/actions/table";
import { POSClient } from "./pos-client";
import { notFound } from "next/navigation";

export default async function POSOrderPage(
  { params }: { params: Promise<{ tableId: string }> }
) {
  const { tableId } = await params;
  
  const [table, order, categories, menuItems] = await Promise.all([
    getTableById(tableId),
    getOrCreateActiveOrder(tableId),
    getCategories(),
    getMenuItems(),
  ]);

  if (!table) {
    notFound();
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden bg-slate-50">
      <POSClient 
        table={table}
        order={order}
        categories={categories}
        menuItems={menuItems}
      />
    </div>
  );
}
