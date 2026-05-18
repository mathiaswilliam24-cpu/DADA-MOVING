"use client";

import { useState } from "react";

interface Props {
  bookingId: string;
  currentStatus: string;
  currentPayment: string;
}

const statusOptions = ["PENDING", "CONFIRMED", "ACTIVE", "COMPLETED", "CANCELLED"];

export default function AdminBookingActions({ bookingId, currentStatus, currentPayment }: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);

  const handleChange = async (newStatus: string) => {
    setSaving(true);
    const res = await fetch(`/api/admin/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) setStatus(newStatus);
    setSaving(false);
  };

  return (
    <select
      value={status}
      onChange={(e) => handleChange(e.target.value)}
      disabled={saving}
      className="text-xs bg-[#1f2937] border border-[#374151] text-white rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#2563eb] disabled:opacity-50"
    >
      {statusOptions.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
}
