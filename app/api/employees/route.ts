import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const employees = await db.getEmployees();
    return NextResponse.json(employees);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    await db.addEmployee(data);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add employee" }, { status: 500 });
  }
}
