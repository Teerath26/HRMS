import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    if (!Array.isArray(data)) {
      return NextResponse.json({ error: "Data must be an array" }, { status: 400 });
    }
    
    for (const emp of data) {
      await db.addEmployee(emp);
    }
    
    return NextResponse.json({ success: true, count: data.length });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add employees" }, { status: 500 });
  }
}
