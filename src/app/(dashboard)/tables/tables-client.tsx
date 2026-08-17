"use client";

import { useState } from "react";
import { TableStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { saveTable, updateTableStatus, openTableSession, closeTableSession, deleteTable } from "@/lib/actions/table";
import { Plus, MoreVertical, Trash2, Edit3 } from "lucide-react";
import Link from "next/link";
import { PrepTimer, type KitchenProgress } from "./prep-timer";

interface TableWithDetails {
  id: string;
  name: string;
  capacity: number;
  status: TableStatus;
  runningTotal: number;
  activeSession: any;
  activeOrder: any;
  prepTimer: KitchenProgress | null;
}

const STATUS_TEXT_CLASS: Record<TableStatus, string> = {
  [TableStatus.AVAILABLE]: "text-green-700",
  [TableStatus.OCCUPIED]: "text-amber-700",
  [TableStatus.RESERVED]: "text-blue-700",
  [TableStatus.CLEANING]: "text-purple-700",
};

// Solid (non-gradient) fill per status, used for the table cards and the legend swatches
const STATUS_CARD_CLASS: Record<TableStatus, string> = {
  [TableStatus.AVAILABLE]: "bg-green-100 border-green-300",
  [TableStatus.OCCUPIED]: "bg-amber-100 border-amber-300",
  [TableStatus.RESERVED]: "bg-blue-100 border-blue-300",
  [TableStatus.CLEANING]: "bg-purple-100 border-purple-300",
};

const STATUS_LEGEND: { status: TableStatus; label: string }[] = [
  { status: TableStatus.AVAILABLE, label: "Available" },
  { status: TableStatus.OCCUPIED, label: "Occupied" },
  { status: TableStatus.RESERVED, label: "Reserved" },
  { status: TableStatus.CLEANING, label: "Cleaning" },
];

export function TablesClient({ initialData }: { initialData: TableWithDetails[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<TableWithDetails | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  // Form state
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState(4);
  const [status, setStatus] = useState<TableStatus>(TableStatus.AVAILABLE);

  // Counter metrics
  const totalTables = initialData.length;
  const availableCount = initialData.filter((t) => t.status === TableStatus.AVAILABLE).length;
  const occupiedCount = initialData.filter((t) => t.status === TableStatus.OCCUPIED).length;
  const reservedCount = initialData.filter((t) => t.status === TableStatus.RESERVED).length;
  const cleaningCount = initialData.filter((t) => t.status === TableStatus.CLEANING).length;

  const openForm = (table?: TableWithDetails) => {
    if (table) {
      setEditingTable(table);
      setName(table.name);
      setCapacity(table.capacity);
      setStatus(table.status);
    } else {
      setEditingTable(null);
      setName("");
      setCapacity(4);
      setStatus(TableStatus.AVAILABLE);
    }
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveTable({
      id: editingTable?.id,
      name,
      capacity,
      status,
    });
    setIsOpen(false);
  };

  const handleStatusChange = async (id: string, newStatus: TableStatus) => {
    try {
      await updateTableStatus(id, newStatus);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleOpenSession = async (id: string) => {
    try {
      await openTableSession(id);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCloseSession = async (id: string, nextStatus: TableStatus = TableStatus.CLEANING) => {
    try {
      await closeTableSession(id, nextStatus);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this table?")) {
      try {
        await deleteTable(id);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const filteredTables = initialData.filter((t) => {
    if (filterStatus === "ALL") return true;
    return t.status === filterStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Table Management</h1>
          <p className="text-sm text-slate-500">Monitor table status, active sessions, and seating capacity.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Button size="sm" onClick={() => openForm()}>
            <Plus className="w-4 h-4 mr-1.5" /> Add Table
          </Button>
          {/* Color legend */}
          <div className="flex items-center gap-3 text-xs text-slate-500">
            {STATUS_LEGEND.map(({ status: s, label }) => (
              <span key={s} className="flex items-center gap-1.5">
                <span className={`inline-block w-2.5 h-2.5 rounded-full border ${STATUS_CARD_CLASS[s]}`} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Status filter counters */}
      <div className="flex flex-wrap gap-px border border-slate-200 rounded-sm overflow-hidden text-sm w-fit">
        <button
          type="button"
          onClick={() => setFilterStatus("ALL")}
          className={`px-3 py-2 border-r border-slate-200 last:border-r-0 ${filterStatus === "ALL" ? "bg-slate-900 text-white" : "bg-white hover:bg-slate-50"}`}
        >
          All <span className="font-semibold">{totalTables}</span>
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus(TableStatus.AVAILABLE)}
          className={`px-3 py-2 border-r border-slate-200 last:border-r-0 ${filterStatus === TableStatus.AVAILABLE ? "bg-slate-900 text-white" : "bg-white hover:bg-slate-50"}`}
        >
          Available <span className="font-semibold">{availableCount}</span>
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus(TableStatus.OCCUPIED)}
          className={`px-3 py-2 border-r border-slate-200 last:border-r-0 ${filterStatus === TableStatus.OCCUPIED ? "bg-slate-900 text-white" : "bg-white hover:bg-slate-50"}`}
        >
          Occupied <span className="font-semibold">{occupiedCount}</span>
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus(TableStatus.RESERVED)}
          className={`px-3 py-2 border-r border-slate-200 last:border-r-0 ${filterStatus === TableStatus.RESERVED ? "bg-slate-900 text-white" : "bg-white hover:bg-slate-50"}`}
        >
          Reserved <span className="font-semibold">{reservedCount}</span>
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus(TableStatus.CLEANING)}
          className={`px-3 py-2 ${filterStatus === TableStatus.CLEANING ? "bg-slate-900 text-white" : "bg-white hover:bg-slate-50"}`}
        >
          Cleaning <span className="font-semibold">{cleaningCount}</span>
        </button>
      </div>

      {/* Table grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredTables.length === 0 ? (
          <div className="col-span-full text-center py-12 border border-slate-200 rounded-sm text-slate-500 text-sm">
            No tables match the selected filter.
          </div>
        ) : (
          filteredTables.map((t) => (
            <div key={t.id} className={`border rounded-sm p-3 flex flex-col gap-2 ${STATUS_CARD_CLASS[t.status]}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-slate-900">{t.name}</div>
                  <div className="text-xs text-slate-600">{t.capacity} seats</div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger className="h-7 w-7 inline-flex items-center justify-center rounded hover:bg-black/10 text-slate-600">
                    <MoreVertical className="w-4 h-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openForm(t)}>
                      <Edit3 className="w-4 h-4 mr-2" /> Edit Table
                    </DropdownMenuItem>
                    {t.status === TableStatus.AVAILABLE && (
                      <DropdownMenuItem onClick={() => handleStatusChange(t.id, TableStatus.RESERVED)}>
                        Mark Reserved
                      </DropdownMenuItem>
                    )}
                    {t.status === TableStatus.OCCUPIED && (
                      <DropdownMenuItem onClick={() => handleCloseSession(t.id, TableStatus.CLEANING)}>
                        Close Session (Cleaning)
                      </DropdownMenuItem>
                    )}
                    {(t.status === TableStatus.CLEANING || t.status === TableStatus.RESERVED) && (
                      <DropdownMenuItem onClick={() => handleStatusChange(t.id, TableStatus.AVAILABLE)}>
                        Mark Available
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(t.id)}>
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold uppercase ${STATUS_TEXT_CLASS[t.status]}`}>
                  {t.status}
                </span>
                {t.status === TableStatus.OCCUPIED && (
                  <span className="text-sm font-semibold text-slate-900">₹{t.runningTotal.toFixed(2)}</span>
                )}
              </div>

              {t.status === TableStatus.OCCUPIED && t.prepTimer && (
                <PrepTimer progress={t.prepTimer} />
              )}

              <div className="mt-1 pt-2 border-t border-black/10">
                {t.status === TableStatus.AVAILABLE && (
                  <Button size="sm" variant="outline" className="w-full bg-white" onClick={() => handleOpenSession(t.id)}>
                    Open Table
                  </Button>
                )}
                {t.status === TableStatus.OCCUPIED && (
                  <Link href={`/pos/table/${t.id}`} className="w-full block">
                    <Button size="sm" className="w-full">View Order</Button>
                  </Link>
                )}
                {t.status === TableStatus.CLEANING && (
                  <Button size="sm" variant="outline" className="w-full bg-white" onClick={() => handleStatusChange(t.id, TableStatus.AVAILABLE)}>
                    Make Available
                  </Button>
                )}
                {t.status === TableStatus.RESERVED && (
                  <Button size="sm" variant="outline" className="w-full bg-white" onClick={() => handleOpenSession(t.id)}>
                    Seat Guests
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTable ? "Edit Table" : "Add New Table"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="tableName">Table Name / Number *</Label>
              <Input id="tableName" placeholder="e.g. Table 1 or T-04" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Seating Capacity *</Label>
              <Input id="capacity" type="number" min={1} value={capacity} onChange={(e) => setCapacity(parseInt(e.target.value))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Initial Status</Label>
              <Select value={status} onValueChange={(val) => setStatus(val as TableStatus)}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TableStatus.AVAILABLE}>AVAILABLE</SelectItem>
                  <SelectItem value={TableStatus.OCCUPIED}>OCCUPIED</SelectItem>
                  <SelectItem value={TableStatus.RESERVED}>RESERVED</SelectItem>
                  <SelectItem value={TableStatus.CLEANING}>CLEANING</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit">Save Table</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
