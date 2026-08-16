"use client";

import { MenuItem, MenuCategory } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { toggleItemAvailability, deleteMenuItem } from "@/lib/actions/menu";
import { Plus, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type MenuItemWithCategory = MenuItem & { category: MenuCategory };

export function ItemsClient({ initialData }: { initialData: MenuItemWithCategory[] }) {
  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      await toggleItemAvailability(id, !currentStatus);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this menu item?")) {
      try {
        await deleteMenuItem(id);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Menu Items</h2>
        <Link href="/menu/items/new">
          <Button><Plus className="w-4 h-4 mr-2" /> Add Item</Button>
        </Link>
      </div>

      <div className="border rounded-lg bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Available</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No menu items found. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              initialData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.imageUrl ? (
                      <div className="relative w-10 h-10 rounded-md overflow-hidden bg-gray-100">
                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                        No img
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {item.name}
                    {item.sku && <span className="block text-xs text-muted-foreground">SKU: {item.sku}</span>}
                  </TableCell>
                  <TableCell>{item.category.name}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.isVeg ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                      {item.isVeg ? 'Veg' : 'Non-Veg'}
                    </span>
                  </TableCell>
                  <TableCell>₹{item.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Switch 
                      checked={item.isAvailable} 
                      onCheckedChange={() => handleToggle(item.id, item.isAvailable)} 
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/menu/items/${item.id}`}>
                      <Button variant="ghost" size="icon">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
