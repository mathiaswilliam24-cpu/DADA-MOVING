import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "DRIVER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const booking = await db.booking.findFirst({
      where: { id, assignedDriverId: session.user.id },
      include: {
        van: true,
        user: { select: { name: true, email: true, phone: true } },
        checkIn: true,
        dropOff: true,
      },
    });

    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    return NextResponse.json(booking);
  } catch {
    return NextResponse.json({ error: "Failed to fetch delivery" }, { status: 500 });
  }
}

// Mark as delivered
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "DRIVER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { driverNote } = await req.json();

    const booking = await db.booking.findFirst({
      where: { id, assignedDriverId: session.user.id, status: "CONFIRMED" },
    });

    if (!booking) return NextResponse.json({ error: "Booking not found or not assignable" }, { status: 404 });

    const updated = await db.booking.update({
      where: { id },
      data: {
        status: "DELIVERED",
        deliveredAt: new Date(),
        driverNote: driverNote || null,
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update delivery" }, { status: 500 });
  }
}
