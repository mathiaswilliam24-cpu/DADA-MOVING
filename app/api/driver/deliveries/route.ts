import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "DRIVER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);

    const [todayDeliveries, upcomingDeliveries, completedDeliveries] = await Promise.all([
      // Today's deliveries
      db.booking.findMany({
        where: {
          assignedDriverId: session.user.id,
          startDate: { gte: startOfToday, lt: endOfToday },
          status: { in: ["CONFIRMED", "DELIVERED", "CHECKIN_COMPLETE", "ACTIVE"] },
        },
        include: {
          van: true,
          user: { select: { name: true, email: true, phone: true } },
          checkIn: { select: { id: true } },
        },
        orderBy: { startDate: "asc" },
      }),
      // Upcoming (next 7 days)
      db.booking.findMany({
        where: {
          assignedDriverId: session.user.id,
          startDate: { gte: endOfToday },
          status: { in: ["CONFIRMED"] },
        },
        include: {
          van: true,
          user: { select: { name: true, email: true, phone: true } },
        },
        orderBy: { startDate: "asc" },
        take: 20,
      }),
      // Recent completed
      db.booking.findMany({
        where: {
          assignedDriverId: session.user.id,
          status: { in: ["COMPLETED", "DROPOFF_PENDING"] },
        },
        include: {
          van: true,
          user: { select: { name: true } },
        },
        orderBy: { startDate: "desc" },
        take: 10,
      }),
    ]);

    return NextResponse.json({ todayDeliveries, upcomingDeliveries, completedDeliveries });
  } catch {
    return NextResponse.json({ error: "Failed to fetch deliveries" }, { status: 500 });
  }
}
