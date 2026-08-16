import { getActiveKOTs } from "@/lib/actions/kot";
import { KitchenClient } from "./kitchen-client";

export default async function KitchenPage() {
  const kots = await getActiveKOTs();

  return (
    <div className="p-8">
      <div className="border-b pb-4 mb-4">
        <h1 className="text-3xl font-bold tracking-tight">Kitchen Display System (KDS)</h1>
        <p className="text-muted-foreground text-sm">Manage Kitchen Order Tickets in real-time.</p>
      </div>
      <KitchenClient initialData={kots} />
    </div>
  );
}
