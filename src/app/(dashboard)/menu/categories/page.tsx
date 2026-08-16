import { getCategories } from "@/lib/actions/menu";
import { CategoryClient } from "./category-client";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="mt-6">
      <CategoryClient initialData={categories} />
    </div>
  );
}
