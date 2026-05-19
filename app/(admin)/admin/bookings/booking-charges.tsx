"use client";

import { useState } from "react";
import AdditionalChargeForm from "@/components/admin/additional-charge-form";
import { DollarSign } from "lucide-react";

interface Props {
  bookingId: string;
  bookingNumber: string;
  customerName: string;
  taxRate: number;
  cardAuthActive: boolean;
  cardAuthExpiresAt?: Date | null;
  chargeCount: number;
}

export default function AdminBookingCharges(props: Props) {
  const [show, setShow] = useState(false);
  const [count, setCount] = useState(props.chargeCount);

  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 bg-red-900/20 hover:bg-red-900/30 border border-red-700/30 px-2 py-1.5 rounded-lg transition-colors whitespace-nowrap"
      >
        <DollarSign size={11} />
        Charge {count > 0 && `(${count})`}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-[#111827] border border-[#1f2937] rounded-2xl w-full max-w-lg p-6">
        <AdditionalChargeForm
          {...props}
          onChargeCreated={() => { setCount(c => c + 1); setShow(false); }}
        />
        <button onClick={() => setShow(false)} className="mt-3 w-full py-2 text-sm text-[#6b7280] hover:text-white">
          Cancel
        </button>
      </div>
    </div>
  );
}
