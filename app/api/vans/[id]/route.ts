import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const van = await db.van.findUnique({ where: { id } });
    if (!van) return NextResponse.json({ error: "Van not found" }, { status: 404 });
    return NextResponse.json(van);
  } catch {
    return NextResponse.json({ error: "Failed to fetch van" }, { status: 500 });
  }
}
