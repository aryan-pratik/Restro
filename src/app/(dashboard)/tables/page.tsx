import { getTables } from "@/lib/actions/table";
import { TablesClient } from "./tables-client";

export default async function TablesPage() {
  const tables = await getTables();

  return (
    <div className="p-8">
      <TablesClient initialData={tables} />
    </div>
  );
}
