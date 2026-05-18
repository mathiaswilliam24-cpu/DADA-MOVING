import { db } from "@/lib/db";
import StatsCards from "@/components/admin/stats-cards";
import RevenueChart from "@/components/admin/revenue-chart";
import { formatCurrency, formatDateTime, getBookingStatusColor, getBookingStatusLabel } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getStats() {
  const now = new Date();
  const startOfDay   = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear  = new Date(now.getFullYear(), 0, 1);

  const [totalBookings, paidBookings, todayAgg, monthAgg, yearAgg, totalCustomers, activeVans] = await Promise.all([
    db.booking.count(),
    db.booking.findMany({ where: { paymentStatus: "PAID" }, select: { totalAmount: true } }),
    db.booking.aggregate({ where: { paymentStatus: "PAID", createdAt: { gte: startOfDay } }, _sum: { totalAmount: true }, _count: true }),
    db.booking.aggregate({ where: { paymentStatus: "PAID", createdAt: { gte: startOfMonth } }, _sum: { totalAmount: true }, _count: true }),
    db.booking.aggregate({ where: { paymentStatus: "PAID", createdAt: { gte: startOfYear } }, _sum: { totalAmount: true }, _count: true }),
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.van.count({ where: { isAvailable: true } }),
  ]);

  const monthlyData = [];
  for (let i = 11; i >= 0; i--) {
    const d   = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const agg = await db.booking.aggregate({
      where: { paymentStatus: "PAID", createdAt: { gte: d, lt: end } },
      _sum: { totalAmount: true }, _count: true,
    });
    monthlyData.push({
      month: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      revenue: agg._sum.totalAmount ?? 0,
      bookings: agg._count,
    });
  }

  return {
    totalBookings,
    totalRevenue: paidBookings.reduce((s, b) => s + b.totalAmount, 0),
    todayRevenue:  todayAgg._sum.totalAmount ?? 0,
    todayBookings: todayAgg._count,
    monthRevenue:  monthAgg._sum.totalAmount ?? 0,
    monthBookings: monthAgg._count,
    yearRevenue:   yearAgg._sum.totalAmount ?? 0,
    yearBookings:  yearAgg._count,
    totalCustomers,
    activeVans,
    monthlyData,
  };
}

export default async function AdminDashboard() {
  const [stats, recentBookings] = await Promise.all([
    getStats(),
    db.booking.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { van: { select: { name: true } }, user: { select: { name: true, email: true } } },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-[#6b7280] text-sm">Overview of DADA MOVING operations.</p>
      </div>

      <StatsCards stats={stats} />
      <RevenueChart data={stats.monthlyData} />

      {/* Recent bookings */}
      <div className="rounded-2xl bg-[#111827] border border-[#1f2937] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1f2937]">
          <h2 className="text-white font-bold">Recent Bookings</h2>
          <Link href="/admin/bookings" className="text-sm text-[#60a5fa] hover:text-white transition-colors">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1f2937]">
                {["Booking #", "Customer", "Van", "Date", "Total", "Status"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((b) => (
                <tr key={b.id} className="border-b border-[#1f2937] hover:bg-[#1f2937]/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-[#60a5fa]">{b.bookingNumber}</td>
                  <td className="px-4 py-3 text-white">{b.user.name || b.user.email}</td>
                  <td className="px-4 py-3 text-[#9ca3af]">{b.van.name}</td>
                  <td className="px-4 py-3 text-[#9ca3af] text-xs">{formatDateTime(b.startDate)}</td>
                  <td className="px-4 py-3 text-white font-semibold">{formatCurrency(b.totalAmount)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getBookingStatusColor(b.status)}`}>
                      {getBookingStatusLabel(b.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
