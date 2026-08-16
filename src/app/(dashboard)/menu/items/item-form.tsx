"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { MenuItemSchema } from "@/lib/validations/menu";
import { MenuCategory, MenuItem } from "@prisma/client";
import { saveMenuItem } from "@/lib/actions/menu";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ItemForm({ initialData, categories }: { initialData?: MenuItem | null, categories: MenuCategory[] }) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  
  const form = useForm<z.infer<typeof MenuItemSchema>>({
    resolver: zodResolver(MenuItemSchema) as any,
    defaultValues: initialData ? {
      id: initialData.id,
      categoryId: initialData.categoryId,
      name: initialData.name,
      description: initialData.description || "",
      price: initialData.price,
      imageUrl: initialData.imageUrl || "",
      isVeg: initialData.isVeg,
      isAvailable: initialData.isAvailable,
      taxRate: initialData.taxRate,
      sku: initialData.sku || "",
      preparationTime: initialData.preparationTime || 0,
      spicyLevel: initialData.spicyLevel || 0,
    } : {
      name: "",
      categoryId: categories.length > 0 ? categories[0].id : "",
      description: "",
      price: 0,
      imageUrl: "",
      isVeg: true,
      isAvailable: true,
      taxRate: 5,
      sku: "",
      preparationTime: 15,
      spicyLevel: 0,
    },
  });

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        form.setValue("imageUrl", data.url);
      } else {
        alert("Upload failed.");
      }
    } catch (error) {
      console.error(error);
      alert("Upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  async function onSubmit(values: z.infer<typeof MenuItemSchema>) {
    try {
      await saveMenuItem(values);
      router.push("/menu/items");
    } catch (error) {
      console.error(error);
      alert("Failed to save menu item");
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{initialData ? "Edit Menu Item" : "Create Menu Item"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control as any}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl><Input placeholder="e.g. Butter Chicken" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control as any}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Input placeholder="Short description..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control as any}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (₹) *</FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="taxRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Rate (%)</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control as any}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl><Input placeholder="Optional SKU code" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="preparationTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prep Time (mins)</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control as any}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-4">
                      <Input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileUpload} 
                        disabled={isUploading}
                        className="w-1/2"
                      />
                      <Input placeholder="Or paste image URL..." {...field} className="w-1/2" />
                    </div>
                  </FormControl>
                  <FormDescription>Upload an image or paste a valid URL</FormDescription>
                  {field.value && <img src={field.value} alt="Preview" className="h-16 rounded mt-2 object-cover" />}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-8 py-2">
              <FormField
                control={form.control as any}
                name="isVeg"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <FormLabel className="font-normal cursor-pointer">Vegetarian</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="isAvailable"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <FormLabel className="font-normal cursor-pointer">Available for Order</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => router.push("/menu/items")}>Cancel</Button>
              <Button type="submit">Save Menu Item</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
