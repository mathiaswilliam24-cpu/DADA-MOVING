import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const available = searchParams.get("available");

    const vans = await db.van.findMany({
      where: available === "true" ? { isAvailable: true } : undefined,
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(vans);
  } catch {
    return NextResponse.json({ error: "Failed to fetch vans" }, { status: 500 });
  }
}
