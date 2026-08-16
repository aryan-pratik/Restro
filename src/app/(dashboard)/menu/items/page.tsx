import { getMenuItems } from "@/lib/actions/menu";
import { ItemsClient } from "./items-client";

export default async function ItemsPage() {
  const items = await getMenuItems();

  return (
    <div className="mt-6">
      <ItemsClient initialData={items} />
    </div>
  );
}
