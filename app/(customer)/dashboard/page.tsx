import { auth } from "@/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowRight, Package, CheckCircle2, AlertCircle, Truck, CalendarDays, MapPin, Download, LogOut, Clock } from "lucide-react";
import { formatCurrency, formatDateTime, getBookingStatusColor, getBookingStatusLabel, getPaymentStatusColor } from "@/lib/utils";
import ExtendRentalButton from "@/components/customer/extend-rental-button";

export const dynamic = "force-dynamic";

type BookingWithRelations = Awaited<ReturnType<typeof getBookings>>[number];

async function getBookings(userId: string) {
  return db.booking.findMany({
    where: { userId },
    include: {
      van: true,
      receipt: true,
      checkIn: { select: { id: true, mileageStart: true, checkInTime: true } },
      dropOff: { select: { id: true, dropOffTime: true } },
      extensions: { orderBy: { createdAt: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });
}

function BookingCard({ booking, onRefresh }: { booking: BookingWithRelations; onRefresh?: () => void }) {
  const needsCheckIn = booking.paymentStatus === "PAID" && !booking.checkIn &&
    ["CONFIRMED", "DELIVERED", "ACTIVE"].includes(booking.status);
  const needsDropOff = booking.checkIn && !booking.dropOff &&
    ["CHECKIN_COMPLETE", "ACTIVE"].includes(booking.status);

  const isActive = booking.paymentStatus === "PAID" &&
    ["CONFIRMED", "ACTIVE", "CHECKIN_COMPLETE", "DELIVERED"].includes(booking.status);

  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#f1f5f9] bg-[#f8fafc]">
        <div>
          <div className="text-xs text-[#94a3b8] mb-0.5">Booking</div>
          <div className="text-[#0f172a] font-black text-sm font-mono">{booking.bookingNumber}</div>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {booking.extensions.length > 0 && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
              {booking.extensions.length} extension{booking.extensions.length > 1 ? "s" : ""}
            </span>
          )}
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getPaymentStatusColor(booking.paymentStatus)}`}>
            {booking.paymentStatus}
          </span>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getBookingStatusColor(booking.status)}`}>
            {getBookingStatusLabel(booking.status)}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-2.5">
        <div className="flex items-center gap-2 text-sm">
          <Truck size={14} className="text-[#1e3a8a] flex-shrink-0" />
          <span className="font-bold text-[#0f172a]">{booking.van.name}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#64748b]">
          <CalendarDays size={14} className="text-[#1e3a8a] flex-shrink-0" />
          <span>{formatDateTime(booking.startDate)}</span>
          <span className="text-[#cbd5e1]">→</span>
          <span className={booking.extensions.length > 0 ? "text-purple-700 font-semibold" : ""}>
            {formatDateTime(booking.endDate)}
          </span>
          <span className="text-xs text-[#94a3b8]">({booking.hours}h)</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#64748b]">
          <MapPin size={14} className="text-[#1e3a8a] flex-shrink-0" />
          <span className="truncate">📍 {booking.deliveryAddress}</span>
        </div>
      </div>

      {/* Action alerts */}
      {needsCheckIn && (
        <div className="mx-5 mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-600 flex-shrink-0" />
            <span className="text-xs font-semibold text-amber-800">Check-In required to start your rental</span>
          </div>
          <Link href={`/bookings/${booking.id}/checkin`}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black rounded-lg whitespace-nowrap">
            Check-In →
          </Link>
        </div>
      )}

      {needsDropOff && (
        <div className="mx-5 mb-4 bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <LogOut size={16} className="text-blue-600 flex-shrink-0" />
            <span className="text-xs font-semibold text-blue-800">Complete your rental with Drop-Off</span>
          </div>
          <Link href={`/bookings/${booking.id}/dropoff`}
            className="px-3 py-1.5 bg-[#1e3a8a] hover:bg-[#1e2f6b] text-white text-xs font-black rounded-lg whitespace-nowrap">
            Drop-Off →
          </Link>
        </div>
      )}

      {booking.checkIn && !booking.dropOff && (
        <div className="mx-5 mb-4 bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
          <CheckCircle2 size={14} className="text-green-600" />
          <span className="text-xs font-semibold text-green-800">
            Check-In complete · Departure mileage: {booking.checkIn.mileageStart} miles
          </span>
        </div>
      )}

      {/* Extension history (compact) */}
      {booking.extensions.length > 0 && (
        <div className="mx-5 mb-4 bg-purple-50 border border-purple-200 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Clock size={13} className="text-purple-600" />
            <span className="text-xs font-bold text-purple-800">Extension History</span>
          </div>
          <div className="space-y-1.5">
            {booking.extensions.map((ext, i) => (
              <div key={ext.id} className="flex items-center justify-between text-xs text-purple-700">
                <span>Extension #{i + 1}: +{ext.additionalHours}h</span>
                <span className="font-semibold">+{formatCurrency(ext.totalAdditional)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-4 border-t border-[#f1f5f9]">
        <div>
          <div className="text-xs text-[#94a3b8]">Total</div>
          <div className="text-[#0f172a] font-black text-xl">{formatCurrency(booking.totalAmount)}</div>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Extend Rental button — client component */}
          {isActive && (
            <ExtendRentalButton
              bookingId={booking.id}
              bookingNumber={booking.bookingNumber}
              endDate={booking.endDate}
              vanName={booking.van.name}
              currentHours={booking.hours}
              status={booking.status}
              onExtended={() => window.location.reload()}
            />
          )}
          <Link href={`/bookings/${booking.id}`}
            className="px-3 py-2 text-xs font-bold text-[#1e3a8a] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl">
            Details
          </Link>
          {booking.paymentStatus === "PAID" && (
            <Link href={`/bookings/${booking.id}?action=receipt`}
              className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-white bg-[#f59e0b] hover:bg-[#d97706] rounded-xl">
              <Download size={11} /> Receipt
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  const bookings = await getBookings(session.user.id);

  const paid = bookings.filter(b => b.paymentStatus === "PAID").length;
  const total = bookings.reduce((s, b) => s + (b.paymentStatus === "PAID" ? b.totalAmount : 0), 0);
  const needsAction = bookings.filter(b =>
    (b.paymentStatus === "PAID" && !b.checkIn && ["CONFIRMED", "DELIVERED", "ACTIVE"].includes(b.status)) ||
    (b.checkIn && !b.dropOff && ["CHECKIN_COMPLETE", "ACTIVE"].includes(b.status))
  ).length;
  const totalExtensions = bookings.reduce((s, b) => s + b.extensions.length, 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-[#0f172a] mb-1">
          Welcome back, {session.user.name?.split(" ")[0]}!
        </h1>
        <p className="text-[#64748b] text-sm">Manage your DADA MOVING rentals.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Bookings", value: bookings.length },
          { label: "Confirmed", value: paid },
          { label: "Total Spent", value: formatCurrency(total) },
          { label: "Action Required", value: needsAction, alert: needsAction > 0 },
        ].map((s) => (
          <div key={s.label} className={`p-4 rounded-xl border ${s.alert ? "bg-amber-50 border-amber-200" : "bg-white border-[#e2e8f0]"}`}>
            <div className={`text-xl font-black ${s.alert ? "text-amber-600" : "text-[#0f172a]"}`}>{s.value}</div>
            <div className="text-xs text-[#64748b] mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Bookings */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-black text-[#0f172a]">My Bookings</h2>
        <Link href="/booking" className="text-sm text-[#1e3a8a] font-semibold hover:underline flex items-center gap-1">
          New booking <ArrowRight size={14} />
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-16 rounded-2xl bg-white border border-[#e2e8f0]">
          <Package size={40} className="mx-auto text-[#cbd5e1] mb-3" />
          <p className="text-[#0f172a] font-semibold mb-1">No bookings yet</p>
          <p className="text-[#64748b] text-sm mb-5">Book your first DADA MOVING van!</p>
          <Link href="/booking" className="px-5 py-2.5 bg-[#f59e0b] text-white text-sm font-bold rounded-xl hover:bg-[#d97706]">
            Book a Van
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}
