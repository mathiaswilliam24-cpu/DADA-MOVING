import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const taxes = await db.stateTax.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json(taxes);
  } catch {
    return NextResponse.json({ error: "Failed to fetch taxes" }, { status: 500 });
  }
}
