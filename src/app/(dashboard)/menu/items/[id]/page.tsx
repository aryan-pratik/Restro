import { getCategories, getMenuItem } from "@/lib/actions/menu";
import { ItemForm } from "../item-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

export default async function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const [categories, item] = await Promise.all([
    getCategories(),
    getMenuItem(id)
  ]);

  if (!item) {
    notFound();
  }

  return (
    <div className="mt-4">
      <Link href="/menu/items">
        <Button variant="ghost" className="mb-4 -ml-4"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Items</Button>
      </Link>
      <ItemForm categories={categories} initialData={item} />
    </div>
  );
}
