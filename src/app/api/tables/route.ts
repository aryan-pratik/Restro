import { NextRequest, NextResponse } from "next/server";
import { getTables, saveTable } from "@/lib/actions/table";
import { TableSchema } from "@/lib/validations/table";

export async function GET() {
  try {
    const tables = await getTables();
    return NextResponse.json({ success: true, data: tables });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "FETCH_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = TableSchema.parse(body);
    await saveTable(parsed);
    return NextResponse.json({ success: true, message: "Table created successfully" }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: error.message } },
      { status: 400 }
    );
  }
}
