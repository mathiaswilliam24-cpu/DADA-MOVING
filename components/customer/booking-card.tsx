import Link from "next/link";
import { formatCurrency, formatDateTime, getBookingStatusColor, getBookingStatusLabel, getPaymentStatusColor } from "@/lib/utils";
import { CalendarDays, Truck, MapPin, Download, Clock } from "lucide-react";

interface Van { name: string; imageUrl?: string | null; }
interface Booking {
  id: string; bookingNumber: string; startDate: Date | string; endDate: Date | string;
  hours: number; deliveryAddress: string; totalAmount: number;
  status: string; paymentStatus: string; van: Van;
}

export default function BookingCard({ booking }: { booking: Booking }) {
  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#f1f5f9]">
        <div>
          <div className="text-xs text-[#94a3b8] mb-0.5">Booking</div>
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
          <span>{formatDateTime(booking.startDate)}</span>
          <span className="text-[#cbd5e1]">→</span>
          <span>{formatDateTime(booking.endDate)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#64748b]">
          <Clock size={14} className="text-[#1e3a8a] flex-shrink-0" />
          <span>{booking.hours} hour{booking.hours !== 1 ? "s" : ""}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#64748b]">
          <MapPin size={14} className="text-[#1e3a8a] flex-shrink-0" />
          <span className="truncate">{booking.deliveryAddress}</span>
        </div>
      </div>

      <div className="flex items-center justify-between px-5 py-4 border-t border-[#f1f5f9] bg-[#f8fafc]">
        <div>
          <div className="text-xs text-[#94a3b8]">Total</div>
          <div className="text-[#0f172a] font-black text-xl">{formatCurrency(booking.totalAmount)}</div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/bookings/${booking.id}`} className="px-4 py-2 text-xs font-bold text-[#1e3a8a] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors">
            View Details
          </Link>
          {booking.paymentStatus === "PAID" && (
            <Link href={`/bookings/${booking.id}?action=receipt`} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#f59e0b] hover:bg-[#d97706] rounded-xl transition-colors">
              <Download size={12} /> Receipt
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
