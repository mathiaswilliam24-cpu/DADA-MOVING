"use client";

import { useState, useEffect } from "react";
import { Clock, AlertCircle } from "lucide-react";
import ExtendRentalModal from "./extend-rental-modal";

interface Props {
  bookingId: string;
  bookingNumber: string;
  endDate: Date | string;
  vanName: string;
  currentHours: number;
  status: string;
  onExtended: () => void;
}

export default function ExtendRentalButton({
  bookingId, bookingNumber, endDate, vanName, currentHours, status, onExtended,
}: Props) {
  const [canExtend, setCanExtend] = useState(true);
  const [minutesLeft, setMinutesLeft] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const check = () => {
      const now = new Date();
      const end = new Date(endDate);
      const minutes = (end.getTime() - now.getTime()) / 60000;
      setMinutesLeft(Math.floor(minutes));
      setCanExtend(minutes >= 30);
    };
    check();
    const interval = setInterval(check, 30000); // re-check every 30s
    return () => clearInterval(interval);
  }, [endDate]);

  // Only show for active/confirmed paid bookings
  const isActiveBooking = ["CONFIRMED", "ACTIVE", "CHECKIN_COMPLETE", "DELIVERED"].includes(status);
  if (!isActiveBooking) return null;

  if (!canExtend) {
    return (
      <div className="mt-3 flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
        <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
        <span>Rental extensions are no longer available within 30 minutes of your scheduled return time. Please contact DADA MOVING for assistance.</span>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#1e3a8a] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors"
      >
        <Clock size={13} />
        Extend Rental
        {minutesLeft !== null && minutesLeft < 120 && (
          <span className="text-amber-600 font-semibold">({minutesLeft}m left)</span>
        )}
      </button>

      {showModal && (
        <ExtendRentalModal
          bookingId={bookingId}
          bookingNumber={bookingNumber}
          currentEndDate={endDate}
          vanName={vanName}
          currentHours={currentHours}
          onClose={() => setShowModal(false)}
          onSuccess={onExtended}
        />
      )}
    </>
  );
}
