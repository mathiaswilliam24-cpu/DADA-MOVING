"use client";

import { useEffect, useState } from "react";
import { calculatePrice } from "@/lib/tax-calculator";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle2, Info, Tag } from "lucide-react";

interface Props { hours: number; stateCode: string; hourlyRate?: number; insuranceFee?: number; }

export default function PriceCalculator({ hours, stateCode, hourlyRate = 17, insuranceFee = 4 }: Props) {
  const [animKey, setAnimKey] = useState(0);
  useEffect(() => { setAnimKey((k) => k + 1); }, [hours, stateCode]);

  if (hours < 2) {
    return (
      <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5">
        <div className="flex items-center gap-2 text-amber-700 text-sm font-semibold mb-1">
          <Info size={16} /> Price Summary
        </div>
        <p className="text-amber-600 text-sm">Select at least 2 hours to see your price breakdown.</p>
      </div>
    );
  }

  const price = calculatePrice(hours, stateCode || "TX", hourlyRate, insuranceFee);

  return (
    <div key={animKey} className="rounded-2xl bg-white border-2 border-[#1e3a8a] shadow-lg p-5 price-animate">
      <div className="flex items-center gap-2 mb-4">
        <Tag size={18} className="text-[#1e3a8a]" />
        <h3 className="text-[#0f172a] font-black text-lg">Price Summary</h3>
      </div>

      <div className="space-y-2.5 mb-4">
        {[
          { label: `Rental Fee (${hours}h × $${hourlyRate}/hr)`, value: price.rentalFee },
          { label: "Insurance (fixed)",                           value: price.insuranceFee },
          { label: "Subtotal",                                    value: price.subtotal, divider: true },
          { label: `State Tax (${stateCode || "TX"} — ${(price.taxRate * 100).toFixed(2)}%)`, value: price.taxAmount },
        ].map((row) => (
          <div key={row.label}>
            {row.divider && <div className="h-px bg-[#e2e8f0] my-2" />}
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#64748b]">{row.label}</span>
              <span className="text-[#0f172a] font-semibold">{formatCurrency(row.value)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="rounded-xl bg-[#1e3a8a] p-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-blue-300 mb-0.5">Total Amount</div>
          <div className="text-2xl font-black text-white">{formatCurrency(price.total)}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-blue-300">{hours} hour{hours !== 1 ? "s" : ""}</div>
          <div className="text-xs text-[#f59e0b] font-bold mt-0.5">${(price.total / hours).toFixed(2)}/hr effective</div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-green-700 font-semibold bg-green-50 border border-green-200 rounded-lg px-3 py-2">
        <CheckCircle2 size={14} />
        No mileage fees included — drive anywhere!
      </div>
    </div>
  );
}
