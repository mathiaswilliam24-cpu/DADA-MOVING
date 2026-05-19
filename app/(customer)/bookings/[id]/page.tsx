import { auth } from "@/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { formatCurrency, formatDateTime, getBookingStatusColor, getBookingStatusLabel, getPaymentStatusColor } from "@/lib/utils";
import ReceiptButton from "@/components/customer/receipt-button";
import Link from "next/link";
import { ArrowLeft, Truck, CalendarDays, MapPin, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return null;

  const { id } = await params;
  const booking = await db.booking.findFirst({
    where: { id, userId: session.user.id },
    include: { van: true, receipt: true },
  });

  if (!booking) notFound();

  return (
    <div className="max-w-2xl">
      <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-[#6b7280] hover:text-white mb-6 transition-colors">
        <ArrowLeft size={14} />
        Back to dashboard
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white font-mono">{booking.bookingNumber}</h1>
          <p className="text-[#6b7280] text-sm mt-0.5">Booking Details</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getBookingStatusColor(booking.status)}`}>
            {getBookingStatusLabel(booking.status)}
          </span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getPaymentStatusColor(booking.paymentStatus)}`}>
            {booking.paymentStatus}
          </span>
        </div>
      </div>

      {/* Van info */}
      <div className="rounded-2xl bg-[#111827] border border-[#1f2937] p-5 mb-4">
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Truck size={16} className="text-[#2563eb]" />
          Vehicle
        </h2>
        <div className="flex items-center gap-4">
          {booking.van.imageUrl && (
            <img src={booking.van.imageUrl} alt={booking.van.name} className="w-24 h-16 object-cover rounded-xl flex-shrink-0" />
          )}
          <div>
            <div className="text-white font-bold">{booking.van.name}</div>
            <div className="text-[#6b7280] text-sm">{booking.van.cargoCapacity} capacity</div>
          </div>
        </div>
      </div>

      {/* Rental details */}
      <div className="rounded-2xl bg-[#111827] border border-[#1f2937] p-5 mb-4">
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <CalendarDays size={16} className="text-[#2563eb]" />
          Rental Details
        </h2>
        <div className="space-y-3 text-sm">
          {[
            { label: "Pick Up", value: formatDateTime(booking.startDate), icon: CalendarDays },
            { label: "Return", value: formatDateTime(booking.endDate), icon: CalendarDays },
            { label: "Duration", value: `${booking.hours} hour${booking.hours !== 1 ? "s" : ""}`, icon: Clock },
            { label: "Livraison", value: booking.deliveryAddress, icon: MapPin },
          ].map((row) => (
            <div key={row.label} className="flex items-start gap-2">
              <row.icon size={14} className="text-[#2563eb] mt-0.5 flex-shrink-0" />
              <div className="flex-1 flex items-start justify-between gap-4">
                <span className="text-[#6b7280]">{row.label}</span>
                <span className="text-white text-right">{row.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Price breakdown */}
      <div className="rounded-2xl bg-[#111827] border border-[#1f2937] p-5 mb-6">
        <h2 className="text-white font-semibold mb-4">Price Breakdown</h2>
        <div className="space-y-2.5 text-sm">
          <div className="flex justify-between">
            <span className="text-[#9ca3af]">Rental Fee ({booking.hours}h × $17)</span>
            <span className="text-white">{formatCurrency(booking.rentalFee)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#9ca3af]">Insurance (fixed)</span>
            <span className="text-white">{formatCurrency(booking.insuranceFee)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#9ca3af]">Subtotal</span>
            <span className="text-white">{formatCurrency(booking.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#9ca3af]">State Tax {booking.stateTaxCode} ({(booking.taxRate * 100).toFixed(2)}%)</span>
            <span className="text-white">{formatCurrency(booking.taxAmount)}</span>
          </div>
          <div className="h-px bg-[#1f2937]" />
          <div className="flex justify-between font-bold">
            <span className="text-white">Total</span>
            <span className="text-white text-lg">{formatCurrency(booking.totalAmount)}</span>
          </div>
        </div>

        <div className="mt-3 text-xs text-green-400 flex items-center gap-1.5">
          ✓ No mileage fees charged
        </div>
      </div>

      {/* Actions */}
      {booking.paymentStatus === "PAID" && (
        <ReceiptButton bookingId={booking.id} />
      )}
    </div>
  );
}
