import { auth } from "@/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Truck, MapPin, Clock, Phone, Navigation, CheckCircle2 } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

function statusBadge(status: string) {
  const map: Record<string, string> = {
    CONFIRMED: "bg-blue-100 text-blue-700 border-blue-200",
    DELIVERED: "bg-green-100 text-green-700 border-green-200",
    CHECKIN_COMPLETE: "bg-purple-100 text-purple-700 border-purple-200",
    ACTIVE: "bg-amber-100 text-amber-700 border-amber-200",
    DROPOFF_PENDING: "bg-orange-100 text-orange-700 border-orange-200",
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
    DROPOFF_PENDING: "Drop-Off Pending",
    COMPLETED: "Completed",
  };
  return map[status] || status;
}

export default async function DriverDeliveriesPage() {
  const session = await auth();
  if (!session?.user) return null;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const allBookings = await db.booking.findMany({
    where: { assignedDriverId: session.user.id },
    include: {
      van: true,
      user: { select: { name: true, phone: true } },
      checkIn: { select: { id: true } },
    },
    orderBy: { startDate: "desc" },
    take: 50,
  });

  const today = allBookings.filter(b => new Date(b.startDate) >= startOfToday);
  const past = allBookings.filter(b => new Date(b.startDate) < startOfToday);

  const DeliveryCard = ({ booking }: { booking: typeof allBookings[0] }) => (
    <Link href={`/driver/deliveries/${booking.id}`}
      className="block bg-white rounded-2xl border border-[#e2e8f0] hover:border-[#1e3a8a] hover:shadow-md transition-all overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#f1f5f9]">
        <span className="font-black text-xs font-mono text-[#1e3a8a]">{booking.bookingNumber}</span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${statusBadge(booking.status)}`}>
          {statusLabel(booking.status)}
        </span>
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-2 text-sm font-bold text-[#0f172a]">
          <Truck size={13} className="text-[#1e3a8a]" />
          {booking.van.name}
        </div>
        <div className="flex items-center gap-2 text-sm text-[#64748b]">
          <Clock size={13} className="text-[#1e3a8a]" />
          {formatDateTime(booking.startDate)}
        </div>
        <div className="flex items-start gap-2 text-sm text-[#64748b]">
          <MapPin size={13} className="text-[#1e3a8a] flex-shrink-0 mt-0.5" />
          <span className="truncate">{booking.deliveryAddress}</span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-[#f1f5f9]">
          <span className="text-sm font-medium text-[#0f172a]">{booking.user.name}</span>
          <div className="flex items-center gap-2">
            {booking.user.phone && (
              <a href={`tel:${booking.user.phone}`} onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-xs text-[#1e3a8a] bg-blue-50 border border-blue-200 px-2 py-1 rounded-lg font-semibold">
                <Phone size={11} /> Call
              </a>
            )}
            {booking.status === "CONFIRMED" && (
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.deliveryAddress)}`}
                target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-xs text-white bg-[#1e3a8a] px-2 py-1 rounded-lg font-semibold">
                <Navigation size={11} /> GPS
              </a>
            )}
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-[#0f172a]">All Deliveries</h1>

      {/* Today */}
      <div>
        <h2 className="font-bold text-[#0f172a] mb-3 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Today ({today.length})
        </h2>
        {today.length === 0 ? (
          <div className="text-center py-8 rounded-2xl bg-white border border-[#e2e8f0]">
            <CheckCircle2 size={28} className="mx-auto text-green-400 mb-2" />
            <p className="text-[#64748b] text-sm">No deliveries today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {today.map(b => <DeliveryCard key={b.id} booking={b} />)}
          </div>
        )}
      </div>

      {/* Past */}
      {past.length > 0 && (
        <div>
          <h2 className="font-bold text-[#64748b] mb-3 text-sm uppercase tracking-wide">Previous Deliveries</h2>
          <div className="space-y-3">
            {past.map(b => <DeliveryCard key={b.id} booking={b} />)}
          </div>
        </div>
      )}

      {allBookings.length === 0 && (
        <div className="text-center py-16 rounded-2xl bg-white border border-[#e2e8f0]">
          <Truck size={36} className="mx-auto text-[#cbd5e1] mb-3" />
          <p className="font-semibold text-[#0f172a]">No deliveries assigned yet</p>
          <p className="text-[#64748b] text-sm">Your deliveries will appear here once assigned by the admin.</p>
        </div>
      )}
    </div>
  );
}
