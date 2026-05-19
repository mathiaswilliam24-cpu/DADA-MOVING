import { auth } from "@/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Truck, MapPin, Clock, Phone, CheckCircle2, AlertCircle, Navigation } from "lucide-react";
import { formatDateTime, formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

function statusBadge(status: string) {
  const map: Record<string, string> = {
    CONFIRMED: "bg-blue-100 text-blue-700 border-blue-200",
    DELIVERED: "bg-green-100 text-green-700 border-green-200",
    CHECKIN_COMPLETE: "bg-purple-100 text-purple-700 border-purple-200",
    ACTIVE: "bg-amber-100 text-amber-700 border-amber-200",
    COMPLETED: "bg-gray-100 text-gray-600 border-gray-200",
  };
  return map[status] || "bg-gray-100 text-gray-600 border-gray-200";
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    CONFIRMED: "Ready to Deliver",
    DELIVERED: "Delivered ✓",
    CHECKIN_COMPLETE: "Check-In Done",
    ACTIVE: "Active Rental",
    COMPLETED: "Completed",
  };
  return map[status] || status;
}

export default async function DriverDashboard() {
  const session = await auth();
  if (!session?.user) return null;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);

  const [todayDeliveries, upcomingCount, completedToday] = await Promise.all([
    db.booking.findMany({
      where: {
        assignedDriverId: session.user.id,
        startDate: { gte: startOfToday, lt: endOfToday },
        status: { notIn: ["CANCELLED"] },
      },
      include: {
        van: true,
        user: { select: { name: true, phone: true } },
        checkIn: { select: { id: true } },
      },
      orderBy: { startDate: "asc" },
    }),
    db.booking.count({
      where: {
        assignedDriverId: session.user.id,
        startDate: { gte: endOfToday },
        status: "CONFIRMED",
      },
    }),
    db.booking.count({
      where: {
        assignedDriverId: session.user.id,
        deliveredAt: { gte: startOfToday, lt: endOfToday },
      },
    }),
  ]);

  const pendingDeliveries = todayDeliveries.filter(b => b.status === "CONFIRMED");
  const deliveredToday = todayDeliveries.filter(b => b.status !== "CONFIRMED");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#0f172a]">
          Good {now.getHours() < 12 ? "Morning" : now.getHours() < 17 ? "Afternoon" : "Evening"}, {session.user.name?.split(" ")[0]}! 👋
        </h1>
        <p className="text-[#64748b] text-sm mt-0.5">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Today's Deliveries", value: todayDeliveries.length, color: "text-[#1e3a8a]", bg: "bg-blue-50 border-blue-200" },
          { label: "Delivered Today", value: completedToday, color: "text-green-700", bg: "bg-green-50 border-green-200" },
          { label: "Upcoming", value: upcomingCount, color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
        ].map((s) => (
          <div key={s.label} className={`p-3 rounded-2xl border ${s.bg} text-center`}>
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-xs text-[#64748b] mt-0.5 leading-tight">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Today's Deliveries */}
      <div>
        <h2 className="font-black text-[#0f172a] text-lg mb-3 flex items-center gap-2">
          <Truck size={18} className="text-[#1e3a8a]" />
          Today's Deliveries
          {pendingDeliveries.length > 0 && (
            <span className="text-xs font-bold px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">
              {pendingDeliveries.length} pending
            </span>
          )}
        </h2>

        {todayDeliveries.length === 0 ? (
          <div className="text-center py-12 rounded-2xl bg-white border border-[#e2e8f0]">
            <CheckCircle2 size={36} className="mx-auto text-green-400 mb-2" />
            <p className="font-semibold text-[#0f172a]">No deliveries today</p>
            <p className="text-[#64748b] text-sm">Check back later or see upcoming deliveries.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayDeliveries.map((booking) => (
              <Link key={booking.id} href={`/driver/deliveries/${booking.id}`}
                className="block bg-white rounded-2xl border border-[#e2e8f0] hover:border-[#1e3a8a] hover:shadow-md transition-all overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#f1f5f9]">
                  <span className="font-black text-sm font-mono text-[#1e3a8a]">{booking.bookingNumber}</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${statusBadge(booking.status)}`}>
                    {statusLabel(booking.status)}
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#0f172a]">
                    <Truck size={14} className="text-[#1e3a8a]" />
                    {booking.van.name}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#64748b]">
                    <Clock size={14} className="text-[#1e3a8a]" />
                    {formatDateTime(booking.startDate)}
                  </div>
                  <div className="flex items-start gap-2 text-sm text-[#64748b]">
                    <MapPin size={14} className="text-[#1e3a8a] flex-shrink-0 mt-0.5" />
                    <span className="truncate">{booking.deliveryAddress}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[#f1f5f9]">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-7 h-7 rounded-full bg-[#1e3a8a] flex items-center justify-center text-white text-xs font-bold">
                        {booking.user.name?.[0] || "?"}
                      </div>
                      <span className="font-medium text-[#0f172a]">{booking.user.name}</span>
                    </div>
                    {booking.user.phone && (
                      <a href={`tel:${booking.user.phone}`} onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-xs text-[#1e3a8a] font-semibold bg-blue-50 px-2.5 py-1.5 rounded-lg">
                        <Phone size={12} /> Call
                      </a>
                    )}
                  </div>
                </div>
                {booking.status === "CONFIRMED" && (
                  <div className="px-4 pb-4">
                    <div className="flex gap-2">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.deliveryAddress)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#1e3a8a] hover:bg-[#1e2f6b] text-white text-sm font-bold rounded-xl"
                      >
                        <Navigation size={14} /> Navigate
                      </a>
                      <div className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#f59e0b] text-white text-sm font-bold rounded-xl">
                        View Details →
                      </div>
                    </div>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick link to all deliveries */}
      <Link href="/driver/deliveries"
        className="flex items-center justify-center gap-2 py-3.5 bg-white border-2 border-[#1e3a8a] text-[#1e3a8a] font-bold rounded-2xl hover:bg-blue-50 transition-colors">
        <ClipboardList size={16} />
        View All Deliveries
      </Link>
    </div>
  );
}

// Fix missing import
function ClipboardList(props: { size: number }) {
  return (
    <svg width={props.size} height={props.size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>
    </svg>
  );
}
