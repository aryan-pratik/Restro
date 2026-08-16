"use client";

import { useState } from "react";
import { TableStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
import { Plus, MoreVertical, Users, Trash2, Edit3, Play, Square, Sparkles, Bookmark } from "lucide-react";
import Link from "next/link";

interface TableWithDetails {
  id: string;
  name: string;
  capacity: number;
  status: TableStatus;
  runningTotal: number;
  activeSession: any;
  activeOrder: any;
}

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

  const getStatusBadgeClass = (s: TableStatus) => {
    switch (s) {
      case TableStatus.AVAILABLE:
        return "bg-green-100 text-green-800 border-green-300";
      case TableStatus.OCCUPIED:
        return "bg-amber-100 text-amber-800 border-amber-300";
      case TableStatus.RESERVED:
        return "bg-blue-100 text-blue-800 border-blue-300";
      case TableStatus.CLEANING:
        return "bg-purple-100 text-purple-800 border-purple-300";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCardBorderClass = (s: TableStatus) => {
    switch (s) {
      case TableStatus.AVAILABLE:
        return "border-green-200 hover:border-green-400 bg-white";
      case TableStatus.OCCUPIED:
        return "border-amber-300 bg-amber-50/30 hover:border-amber-400";
      case TableStatus.RESERVED:
        return "border-blue-200 bg-blue-50/20 hover:border-blue-300";
      case TableStatus.CLEANING:
        return "border-purple-200 bg-purple-50/20 hover:border-purple-300";
      default:
        return "border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Table Management</h1>
          <p className="text-muted-foreground text-sm">Monitor table status, active sessions, and seating capacity.</p>
        </div>
        <Button onClick={() => openForm()}>
          <Plus className="w-4 h-4 mr-2" /> Add Table
        </Button>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="cursor-pointer" onClick={() => setFilterStatus("ALL")}>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total Tables</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{totalTables}</div>
          </CardContent>
        </Card>
        <Card className={`cursor-pointer ${filterStatus === TableStatus.AVAILABLE ? 'ring-2 ring-green-500' : ''}`} onClick={() => setFilterStatus(TableStatus.AVAILABLE)}>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-green-600">Available</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-green-700">{availableCount}</div>
          </CardContent>
        </Card>
        <Card className={`cursor-pointer ${filterStatus === TableStatus.OCCUPIED ? 'ring-2 ring-amber-500' : ''}`} onClick={() => setFilterStatus(TableStatus.OCCUPIED)}>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-amber-600">Occupied</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-amber-700">{occupiedCount}</div>
          </CardContent>
        </Card>
        <Card className={`cursor-pointer ${filterStatus === TableStatus.RESERVED ? 'ring-2 ring-blue-500' : ''}`} onClick={() => setFilterStatus(TableStatus.RESERVED)}>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-blue-600">Reserved</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-blue-700">{reservedCount}</div>
          </CardContent>
        </Card>
        <Card className={`cursor-pointer ${filterStatus === TableStatus.CLEANING ? 'ring-2 ring-purple-500' : ''}`} onClick={() => setFilterStatus(TableStatus.CLEANING)}>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-purple-600">Cleaning</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-purple-700">{cleaningCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Visual Table Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredTables.length === 0 ? (
          <div className="col-span-full text-center py-12 border rounded-lg bg-gray-50 text-muted-foreground">
            No tables match the selected filter.
          </div>
        ) : (
          filteredTables.map((t) => (
            <Card key={t.id} className={`transition-all border-2 shadow-sm ${getCardBorderClass(t.status)}`}>
              <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  {t.name}
                  <span className="text-xs font-normal text-muted-foreground flex items-center">
                    <Users className="w-3 h-3 mr-1 inline" /> {t.capacity}
                  </span>
                </CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-slate-100 p-0 text-slate-700">
                    <MoreVertical className="w-4 h-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openForm(t)}>
                      <Edit3 className="w-4 h-4 mr-2" /> Edit Table
                    </DropdownMenuItem>
                    {t.status === TableStatus.AVAILABLE && (
                      <>
                        <DropdownMenuItem onClick={() => handleOpenSession(t.id)}>
                          <Play className="w-4 h-4 mr-2 text-green-600" /> Start Session (Occupy)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(t.id, TableStatus.RESERVED)}>
                          <Bookmark className="w-4 h-4 mr-2 text-blue-600" /> Mark Reserved
                        </DropdownMenuItem>
                      </>
                    )}
                    {t.status === TableStatus.OCCUPIED && (
                      <DropdownMenuItem onClick={() => handleCloseSession(t.id, TableStatus.CLEANING)}>
                        <Square className="w-4 h-4 mr-2 text-purple-600" /> Close Session (Cleaning)
                      </DropdownMenuItem>
                    )}
                    {t.status === TableStatus.CLEANING && (
                      <DropdownMenuItem onClick={() => handleStatusChange(t.id, TableStatus.AVAILABLE)}>
                        <Sparkles className="w-4 h-4 mr-2 text-green-600" /> Mark Available
                      </DropdownMenuItem>
                    )}
                    {t.status === TableStatus.RESERVED && (
                      <DropdownMenuItem onClick={() => handleStatusChange(t.id, TableStatus.AVAILABLE)}>
                        <Sparkles className="w-4 h-4 mr-2 text-green-600" /> Mark Available
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(t.id)}>
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="flex items-center justify-between mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadgeClass(t.status)}`}>
                    {t.status}
                  </span>
                  {t.status === TableStatus.OCCUPIED && (
                    <span className="text-sm font-bold text-amber-700">
                      ₹{t.runningTotal.toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t flex justify-end">
                  {t.status === TableStatus.AVAILABLE && (
                    <Button size="sm" variant="outline" className="w-full" onClick={() => handleOpenSession(t.id)}>
                      Open Table
                    </Button>
                  )}
                  {t.status === TableStatus.OCCUPIED && (
                    <Link href={`/pos/table/${t.id}`} className="w-full">
                      <Button size="sm" className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                        View Order
                      </Button>
                    </Link>
                  )}
                  {t.status === TableStatus.CLEANING && (
                    <Button size="sm" variant="secondary" className="w-full" onClick={() => handleStatusChange(t.id, TableStatus.AVAILABLE)}>
                      Make Available
                    </Button>
                  )}
                  {t.status === TableStatus.RESERVED && (
                    <Button size="sm" variant="outline" className="w-full" onClick={() => handleOpenSession(t.id)}>
                      Seat Guests
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
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
