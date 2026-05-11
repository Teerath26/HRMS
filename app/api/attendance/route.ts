import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    
    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }
    
    const attendance = await db.getAttendanceForDate(date);
    const isLocked = await db.isDateLocked(date);
    
    return NextResponse.json({ attendance, isLocked });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { date, attendance } = await req.json();
    
    if (!date || !attendance) {
      return NextResponse.json({ error: "Date and attendance data are required" }, { status: 400 });
    }
    
    await db.saveAttendanceForDate(date, attendance);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to save attendance" }, { status: 500 });
  }
}
