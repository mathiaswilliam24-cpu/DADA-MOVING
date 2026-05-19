import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { driverId } = await req.json();

    const booking = await db.booking.update({
      where: { id },
      data: { assignedDriverId: driverId || null },
      include: { assignedDriver: { select: { name: true, email: true } } },
    });

    return NextResponse.json(booking);
  } catch {
    return NextResponse.json({ error: "Failed to assign driver" }, { status: 500 });
  }
}
