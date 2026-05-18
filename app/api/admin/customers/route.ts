import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where = search
      ? {
          role: "CUSTOMER" as never,
          OR: [
            { name: { contains: search, mode: "insensitive" as never } },
            { email: { contains: search, mode: "insensitive" as never } },
          ],
        }
      : { role: "CUSTOMER" as never };

    const [customers, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true, name: true, email: true, phone: true, isActive: true, createdAt: true,
          _count: { select: { bookings: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.user.count({ where }),
    ]);

    return NextResponse.json({ customers, total, page, limit });
  } catch {
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}
