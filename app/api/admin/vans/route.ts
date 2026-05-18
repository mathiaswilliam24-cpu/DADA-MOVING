import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { vanSchema } from "@/lib/validations";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const vans = await db.van.findMany({ orderBy: { createdAt: "asc" } });
    return NextResponse.json(vans);
  } catch {
    return NextResponse.json({ error: "Failed to fetch vans" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const parsed = vanSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid data", issues: parsed.error.issues }, { status: 400 });

    const van = await db.van.create({ data: parsed.data });
    return NextResponse.json(van, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create van" }, { status: 500 });
  }
}
