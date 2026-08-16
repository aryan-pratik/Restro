import { getTables } from "@/lib/actions/table";
import { TablesClient } from "../tables/tables-client";

export default async function POSPage() {
  const tables = await getTables();

  return (
    <div className="p-8 space-y-4">
      <div className="border-b pb-4 mb-4">
        <h1 className="text-3xl font-bold tracking-tight">Point of Sale (POS)</h1>
        <p className="text-muted-foreground text-sm">Select an available table to take a new order, or tap an occupied table to update items & billing.</p>
      </div>
      <TablesClient initialData={tables} />
    </div>
  );
}
