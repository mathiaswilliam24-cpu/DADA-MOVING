import { auth } from "@/auth";
import { db } from "@/lib/db";
import BookingCard from "@/components/customer/booking-card";
import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  const bookings = await db.booking.findMany({
    where: { userId: session.user.id },
    include: { van: true, receipt: true },
    orderBy: { createdAt: "desc" },
  });

  const paid = bookings.filter(b => b.paymentStatus === "PAID").length;
  const total = bookings.reduce((s, b) => s + (b.paymentStatus === "PAID" ? b.totalAmount : 0), 0);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">
          Welcome back, {session.user.name?.split(" ")[0]}!
        </h1>
        <p className="text-[#6b7280] text-sm">Manage your van rentals and receipts.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Bookings", value: bookings.length },
          { label: "Confirmed Bookings", value: paid },
          { label: "Total Spent", value: `$${total.toFixed(2)}` },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-xl bg-[#111827] border border-[#1f2937]">
            <div className="text-xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-[#6b7280] mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Bookings */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">Your Bookings</h2>
        <Link href="/booking" className="text-sm text-[#60a5fa] hover:text-white flex items-center gap-1 transition-colors">
          New booking <ArrowRight size={14} />
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-16 rounded-2xl bg-[#111827] border border-[#1f2937]">
          <Package size={40} className="mx-auto text-[#374151] mb-3" />
          <p className="text-white font-medium mb-1">No bookings yet</p>
          <p className="text-[#6b7280] text-sm mb-5">Book your first van and start moving!</p>
          <Link href="/booking" className="px-5 py-2.5 bg-[#2563eb] text-white text-sm font-semibold rounded-xl hover:bg-[#1d4ed8] transition-colors">
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
