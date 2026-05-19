import { auth } from "@/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowRight, Package, CheckCircle2, AlertCircle, Truck, CalendarDays, MapPin, Download, ClipboardCheck, LogOut } from "lucide-react";
import { formatCurrency, formatDateTime, getBookingStatusColor, getBookingStatusLabel, getPaymentStatusColor } from "@/lib/utils";

export const dynamic = "force-dynamic";

function BookingCard({ booking }: { booking: ReturnType<typeof processBooking> }) {
  const needsCheckIn = booking.paymentStatus === "PAID" && !booking.checkIn &&
    ["CONFIRMED", "DELIVERED", "ACTIVE"].includes(booking.status);
  const needsDropOff = booking.checkIn && !booking.dropOff &&
    ["CHECKIN_COMPLETE", "ACTIVE"].includes(booking.status);

  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#f1f5f9] bg-[#f8fafc]">
        <div>
          <div className="text-xs text-[#94a3b8] mb-0.5">Réservation</div>
          <div className="text-[#0f172a] font-black text-sm font-mono">{booking.bookingNumber}</div>
        </div>
        <div className="flex items-center gap-2">
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
          <span>{formatDateTime(booking.startDate)} → {formatDateTime(booking.endDate)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#64748b]">
          <MapPin size={14} className="text-[#1e3a8a] flex-shrink-0" />
          <span className="truncate">📍 Livraison : {booking.deliveryAddress}</span>
        </div>
      </div>

      {/* Action alerts */}
      {needsCheckIn && (
        <div className="mx-5 mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-600 flex-shrink-0" />
            <span className="text-xs font-semibold text-amber-800">Check-In requis pour démarrer votre location</span>
          </div>
          <Link
            href={`/bookings/${booking.id}/checkin`}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black rounded-lg whitespace-nowrap"
          >
            Faire Check-In →
          </Link>
        </div>
      )}

      {needsDropOff && (
        <div className="mx-5 mb-4 bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <LogOut size={16} className="text-blue-600 flex-shrink-0" />
            <span className="text-xs font-semibold text-blue-800">Terminez votre location avec le Drop-Off</span>
          </div>
          <Link
            href={`/bookings/${booking.id}/dropoff`}
            className="px-3 py-1.5 bg-[#1e3a8a] hover:bg-[#1e2f6b] text-white text-xs font-black rounded-lg whitespace-nowrap"
          >
            Drop-Off →
          </Link>
        </div>
      )}

      {booking.checkIn && (
        <div className="mx-5 mb-4 bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
          <CheckCircle2 size={14} className="text-green-600" />
          <span className="text-xs font-semibold text-green-800">Check-In complété · Km départ: {booking.checkIn.mileageStart}</span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-4 border-t border-[#f1f5f9]">
        <div>
          <div className="text-xs text-[#94a3b8]">Total</div>
          <div className="text-[#0f172a] font-black text-xl">{formatCurrency(booking.totalAmount)}</div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/bookings/${booking.id}`} className="px-3 py-2 text-xs font-bold text-[#1e3a8a] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl">
            Détails
          </Link>
          {booking.paymentStatus === "PAID" && (
            <Link href={`/bookings/${booking.id}?action=receipt`} className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-white bg-[#f59e0b] hover:bg-[#d97706] rounded-xl">
              <Download size={11} /> Reçu
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function processBooking(booking: {
  id: string;
  bookingNumber: string;
  startDate: Date;
  endDate: Date;
  hours: number;
  deliveryAddress: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  van: { name: string; imageUrl?: string | null };
  checkIn: { mileageStart: number } | null;
  dropOff: { id: string } | null;
}) {
  return booking;
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  const bookings = await db.booking.findMany({
    where: { userId: session.user.id },
    include: {
      van: true,
      receipt: true,
      checkIn: { select: { id: true, mileageStart: true, checkInTime: true } },
      dropOff: { select: { id: true, dropOffTime: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const paid = bookings.filter(b => b.paymentStatus === "PAID").length;
  const total = bookings.reduce((s, b) => s + (b.paymentStatus === "PAID" ? b.totalAmount : 0), 0);
  const needsAction = bookings.filter(b =>
    (b.paymentStatus === "PAID" && !b.checkIn) ||
    (b.checkIn && !b.dropOff && ["CHECKIN_COMPLETE", "ACTIVE"].includes(b.status))
  ).length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-[#0f172a] mb-1">
          Bienvenue, {session.user.name?.split(" ")[0]} !
        </h1>
        <p className="text-[#64748b] text-sm">Gérez vos réservations et locations DADA MOVING.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Réservations", value: bookings.length },
          { label: "Confirmées", value: paid },
          { label: "Total dépensé", value: formatCurrency(total) },
          { label: "Action requise", value: needsAction, alert: needsAction > 0 },
        ].map((s) => (
          <div key={s.label} className={`p-4 rounded-xl border ${s.alert ? "bg-amber-50 border-amber-200" : "bg-white border-[#e2e8f0]"}`}>
            <div className={`text-xl font-black ${s.alert ? "text-amber-600" : "text-[#0f172a]"}`}>{s.value}</div>
            <div className="text-xs text-[#64748b] mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Bookings */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-black text-[#0f172a]">Mes Réservations</h2>
        <Link href="/booking" className="text-sm text-[#1e3a8a] font-semibold hover:underline flex items-center gap-1">
          Nouvelle réservation <ArrowRight size={14} />
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-16 rounded-2xl bg-white border border-[#e2e8f0]">
          <Package size={40} className="mx-auto text-[#cbd5e1] mb-3" />
          <p className="text-[#0f172a] font-semibold mb-1">Aucune réservation</p>
          <p className="text-[#64748b] text-sm mb-5">Réservez votre premier van DADA MOVING !</p>
          <Link href="/booking" className="px-5 py-2.5 bg-[#f59e0b] text-white text-sm font-bold rounded-xl hover:bg-[#d97706]">
            Réserver un van
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
