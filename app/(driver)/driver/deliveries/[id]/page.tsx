"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Truck, MapPin, Clock, Phone, Navigation, CheckCircle2, Loader2, ArrowLeft, User, Package, AlertCircle } from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import Link from "next/link";

interface Booking {
  id: string;
  bookingNumber: string;
  status: string;
  startDate: string;
  endDate: string;
  hours: number;
  deliveryAddress: string;
  totalAmount: number;
  deliveredAt?: string | null;
  driverNote?: string | null;
  van: { name: string; imageUrl?: string | null; cargoCapacity: string };
  user: { name: string | null; phone: string | null; email: string };
  checkIn?: { id: string } | null;
}

export default function DriverDeliveryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [driverNote, setDriverNote] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/driver/deliveries/${bookingId}`)
      .then(r => r.json())
      .then(data => { setBooking(data); setLoading(false); });
  }, [bookingId]);

  const handleMarkDelivered = async () => {
    setMarking(true);
    setError(null);
    const res = await fetch(`/api/driver/deliveries/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ driverNote }),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "Failed to mark as delivered");
      setMarking(false);
      return;
    }
    setConfirmed(true);
    setMarking(false);
    setTimeout(() => router.push("/driver"), 2000);
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 size={28} className="animate-spin text-[#1e3a8a]" />
    </div>
  );

  if (!booking) return (
    <div className="text-center py-16">
      <AlertCircle size={36} className="mx-auto text-red-400 mb-2" />
      <p className="text-[#64748b]">Delivery not found.</p>
      <Link href="/driver" className="text-[#1e3a8a] font-semibold mt-2 inline-block">Back to Dashboard</Link>
    </div>
  );

  if (confirmed) return (
    <div className="text-center py-20">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 size={40} className="text-green-600" />
      </div>
      <h2 className="text-2xl font-black text-[#0f172a] mb-2">Van Delivered!</h2>
      <p className="text-[#64748b]">Booking {booking.bookingNumber} marked as delivered.</p>
      <p className="text-sm text-[#94a3b8] mt-1">Redirecting to dashboard...</p>
    </div>
  );

  const isDelivered = booking.status !== "CONFIRMED";

  return (
    <div className="space-y-4">
      <Link href="/driver" className="flex items-center gap-1.5 text-sm text-[#64748b] hover:text-[#0f172a]">
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      {/* Header */}
      <div className="bg-[#1e3a8a] rounded-2xl p-5 text-white">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="text-blue-200 text-xs mb-0.5">Delivery</div>
            <div className="font-black text-lg font-mono">{booking.bookingNumber}</div>
          </div>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
            isDelivered ? "bg-green-500/20 text-green-200 border-green-500/40" : "bg-[#f59e0b]/20 text-amber-200 border-amber-500/40"
          }`}>
            {isDelivered ? "Delivered ✓" : "Ready to Deliver"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-blue-200 text-sm">
          <Clock size={14} />
          {formatDateTime(booking.startDate)} → {formatDateTime(booking.endDate)}
        </div>
      </div>

      {/* Van */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden">
        {booking.van.imageUrl && (
          <img src={booking.van.imageUrl} alt={booking.van.name} className="w-full h-40 object-cover" />
        )}
        <div className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <Truck size={20} className="text-[#1e3a8a]" />
          </div>
          <div>
            <div className="font-bold text-[#0f172a]">{booking.van.name}</div>
            <div className="text-sm text-[#64748b]">{booking.van.cargoCapacity} · {booking.hours}h rental</div>
          </div>
        </div>
      </div>

      {/* Customer */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4 space-y-3">
        <h3 className="font-bold text-[#0f172a] flex items-center gap-2">
          <User size={16} className="text-[#1e3a8a]" /> Customer
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-[#0f172a]">{booking.user.name}</div>
            <div className="text-sm text-[#64748b]">{booking.user.email}</div>
          </div>
          {booking.user.phone && (
            <a href={`tel:${booking.user.phone}`}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#1e3a8a] text-white font-bold rounded-xl text-sm">
              <Phone size={15} /> {booking.user.phone}
            </a>
          )}
        </div>
      </div>

      {/* Delivery Address */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4 space-y-3">
        <h3 className="font-bold text-[#0f172a] flex items-center gap-2">
          <MapPin size={16} className="text-[#1e3a8a]" /> Delivery Address
        </h3>
        <p className="text-[#0f172a] font-medium">{booking.deliveryAddress}</p>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.deliveryAddress)}`}
          target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 bg-[#1e3a8a] hover:bg-[#1e2f6b] text-white font-bold rounded-xl transition-colors"
        >
          <Navigation size={16} /> Open in Google Maps
        </a>
      </div>

      {/* Rental Summary */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4">
        <h3 className="font-bold text-[#0f172a] mb-3 flex items-center gap-2">
          <Package size={16} className="text-[#1e3a8a]" /> Rental Summary
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[#64748b]">Duration</span>
            <span className="font-semibold">{booking.hours} hours</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#64748b]">Total Amount</span>
            <span className="font-black text-[#1e3a8a]">{formatCurrency(booking.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Check-in status */}
      {booking.checkIn ? (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-2xl text-sm text-green-700">
          <CheckCircle2 size={16} />
          <span className="font-semibold">Customer has completed Check-In</span>
        </div>
      ) : booking.status === "DELIVERED" ? (
        <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-700">
          <Clock size={16} />
          <span>Waiting for customer to complete Check-In</span>
        </div>
      ) : null}

      {/* Mark as Delivered */}
      {booking.status === "CONFIRMED" && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-[#374151] mb-1.5">
              Delivery Note (optional)
            </label>
            <textarea
              rows={3}
              value={driverNote}
              onChange={(e) => setDriverNote(e.target.value)}
              placeholder="Any notes about the delivery (parking, condition, etc.)..."
              className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-[#0f172a] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <button
            onClick={handleMarkDelivered}
            disabled={marking}
            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-black rounded-2xl text-lg flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-green-200"
          >
            {marking ? <><Loader2 size={20} className="animate-spin" /> Marking...</> : <>✓ Mark as Delivered</>}
          </button>
          <p className="text-xs text-center text-[#94a3b8]">
            Confirm that the van has been delivered to the customer's address.
          </p>
        </div>
      )}

      {/* Already delivered info */}
      {booking.deliveredAt && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-2xl">
          <div className="flex items-center gap-2 text-green-700 font-bold mb-1">
            <CheckCircle2 size={16} />
            Delivered at {formatDateTime(booking.deliveredAt)}
          </div>
          {booking.driverNote && (
            <p className="text-sm text-green-600 mt-1">Note: {booking.driverNote}</p>
          )}
        </div>
      )}
    </div>
  );
}
