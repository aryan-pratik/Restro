import { NextRequest, NextResponse } from "next/server";
import { getTableById, saveTable, deleteTable } from "@/lib/actions/table";
import { TableSchema } from "@/lib/validations/table";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const table = await getTableById(id);
    if (!table) {
      return NextResponse.json(
        { success: false, error: { code: "TABLE_NOT_FOUND", message: "Table not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: table });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = TableSchema.parse({ ...body, id });
    await saveTable(parsed);
    return NextResponse.json({ success: true, message: "Table updated successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "UPDATE_ERROR", message: error.message } },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteTable(id);
    return NextResponse.json({ success: true, message: "Table deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "DELETE_ERROR", message: error.message } },
      { status: 400 }
    );
  }
}
