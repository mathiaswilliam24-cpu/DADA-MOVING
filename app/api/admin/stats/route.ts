import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [
      totalBookings,
      paidBookings,
      todayBookings,
      monthBookings,
      yearBookings,
      totalCustomers,
      activeVans,
    ] = await Promise.all([
      db.booking.count(),
      db.booking.findMany({
        where: { paymentStatus: "PAID" },
        select: { totalAmount: true },
      }),
      db.booking.aggregate({
        where: { paymentStatus: "PAID", createdAt: { gte: startOfDay } },
        _sum: { totalAmount: true },
        _count: true,
      }),
      db.booking.aggregate({
        where: { paymentStatus: "PAID", createdAt: { gte: startOfMonth } },
        _sum: { totalAmount: true },
        _count: true,
      }),
      db.booking.aggregate({
        where: { paymentStatus: "PAID", createdAt: { gte: startOfYear } },
        _sum: { totalAmount: true },
        _count: true,
      }),
      db.user.count({ where: { role: "CUSTOMER" } }),
      db.van.count({ where: { isAvailable: true } }),
    ]);

    // Monthly revenue for chart (last 12 months)
    const monthlyData = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const agg = await db.booking.aggregate({
        where: { paymentStatus: "PAID", createdAt: { gte: d, lt: end } },
        _sum: { totalAmount: true },
        _count: true,
      });
      monthlyData.push({
        month: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
        revenue: agg._sum.totalAmount ?? 0,
        bookings: agg._count,
      });
    }

    const totalRevenue = paidBookings.reduce((sum, b) => sum + b.totalAmount, 0);

    return NextResponse.json({
      totalBookings,
      totalRevenue,
      todayRevenue: todayBookings._sum.totalAmount ?? 0,
      todayBookings: todayBookings._count,
      monthRevenue: monthBookings._sum.totalAmount ?? 0,
      monthBookings: monthBookings._count,
      yearRevenue: yearBookings._sum.totalAmount ?? 0,
      yearBookings: yearBookings._count,
      totalCustomers,
      activeVans,
      monthlyData,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
