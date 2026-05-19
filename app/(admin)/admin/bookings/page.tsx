import { db } from "@/lib/db";
import { formatCurrency, formatDateTime, getBookingStatusColor, getBookingStatusLabel, getPaymentStatusColor } from "@/lib/utils";
import AdminBookingActions from "./booking-actions";
import AdminBookingCharges from "./booking-charges";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const bookings = await db.booking.findMany({
    include: {
      van: { select: { name: true } },
      user: { select: { name: true, email: true } },
      additionalCharges: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Bookings</h1>
        <p className="text-[#6b7280] text-sm mt-0.5">{bookings.length} total bookings</p>
      </div>

      <div className="rounded-2xl bg-[#111827] border border-[#1f2937] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1f2937]">
                {["Booking #", "Customer", "Van", "Start", "Hours", "Total", "Status", "Payment", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b border-[#1f2937] hover:bg-[#1f2937]/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-[#60a5fa] whitespace-nowrap">{b.bookingNumber}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-white text-xs font-medium">{b.user.name}</div>
                    <div className="text-[#6b7280] text-xs">{b.user.email}</div>
                  </td>
                  <td className="px-4 py-3 text-[#9ca3af] whitespace-nowrap">{b.van.name}</td>
                  <td className="px-4 py-3 text-[#9ca3af] text-xs whitespace-nowrap">{formatDateTime(b.startDate)}</td>
                  <td className="px-4 py-3 text-[#9ca3af] whitespace-nowrap">{b.hours}h</td>
                  <td className="px-4 py-3 text-white font-semibold whitespace-nowrap">{formatCurrency(b.totalAmount)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getBookingStatusColor(b.status)}`}>
                      {getBookingStatusLabel(b.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getPaymentStatusColor(b.paymentStatus)}`}>
                      {b.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <AdminBookingActions bookingId={b.id} currentStatus={b.status} currentPayment={b.paymentStatus} />
                      <AdminBookingCharges
                        bookingId={b.id}
                        bookingNumber={b.bookingNumber}
                        customerName={b.user.name || ""}
                        taxRate={0.0825}
                        cardAuthActive={b.cardAuthActive}
                        cardAuthExpiresAt={b.cardAuthExpiresAt}
                        chargeCount={b.additionalCharges.length}
                      />
                    </div>
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
