import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const drivers = await db.user.findMany({
      where: { role: "DRIVER" },
      select: {
        id: true, name: true, email: true, phone: true, isActive: true, createdAt: true,
        _count: { select: { driverBookings: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(drivers);
  } catch {
    return NextResponse.json({ error: "Failed to fetch drivers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name, email, phone, password } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: "name, email and password are required" }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "Email already exists" }, { status: 409 });

    const hashed = await bcrypt.hash(password, 12);
    const driver = await db.user.create({
      data: { name, email, phone: phone || null, password: hashed, role: "DRIVER", isActive: true },
      select: { id: true, name: true, email: true, phone: true, role: true },
    });

    return NextResponse.json(driver, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create driver" }, { status: 500 });
  }
}
