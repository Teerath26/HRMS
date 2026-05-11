import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month"); // YYYY-MM
    
    if (!month) {
      return NextResponse.json({ error: "Month is required" }, { status: 400 });
    }
    
    const report = await db.getAttendanceReport(month);
    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 });
  }
}
