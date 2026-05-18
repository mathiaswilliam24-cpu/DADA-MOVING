"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle, DollarSign, Shield, Clock, Fuel, Sparkles } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { calculatePrice } from "@/lib/tax-calculator";

function QuickCalculator() {
  const [hours, setHours] = useState(4);
  const price = calculatePrice(hours, "TX");

  return (
    <div className="rounded-2xl bg-[#111827] border border-[#1f2937] p-6">
      <h3 className="text-white font-bold text-lg mb-4">Quick Price Estimate</h3>
      <p className="text-[#6b7280] text-sm mb-5">
        Drag to estimate your cost (Texas 8.25% tax applied as example):
      </p>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm text-[#9ca3af]">Hours: <strong className="text-white">{hours}h</strong></label>
          <span className="text-xs text-[#6b7280]">Min 2h</span>
        </div>
        <input
          type="range"
          min={2}
          max={24}
          value={hours}
          onChange={(e) => setHours(Number(e.target.value))}
          className="w-full accent-blue-500 cursor-pointer"
        />
        <div className="flex justify-between text-xs text-[#4b5563] mt-1">
          <span>2h</span><span>8h</span><span>16h</span><span>24h</span>
        </div>
      </div>

      <div className="space-y-2.5 mb-4">
        {[
          { label: `Rental (${hours}h × $17)`, value: price.rentalFee },
          { label: "Insurance (fixed)", value: price.insuranceFee },
          { label: "Subtotal", value: price.subtotal, sub: true },
          { label: `State Tax TX (8.25%)`, value: price.taxAmount },
        ].map((row) => (
          <div key={row.label} className={`flex justify-between text-sm ${row.sub ? "pt-2 border-t border-[#1f2937]" : ""}`}>
            <span className="text-[#9ca3af]">{row.label}</span>
            <span className="text-white font-medium">{formatCurrency(row.value)}</span>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-[#1e3a5f] border border-[#2563eb]/30 p-4 flex items-center justify-between">
        <span className="text-[#93c5fd] font-semibold">Estimated Total</span>
        <span className="text-white text-xl font-extrabold">{formatCurrency(price.total)}</span>
      </div>
      <p className="text-xs text-[#4b5563] mt-2 text-center">* Taxes vary by state. Select your state during booking for the exact amount.</p>
    </div>
  );
}

const inclusions = [
  "Unlimited mileage",
  "Online booking",
  "Free cancellation (24h+ notice)",
  "Loading ramp (select vans)",
  "GPS-ready vehicles",
  "Clean, well-maintained vans",
];

const extras = [
  { icon: AlertCircle, title: "Late Return Fee", value: "$25/hour", desc: "Applied if the van is returned after the agreed time." },
  { icon: Sparkles,    title: "Cleaning Fee",    value: "$75",      desc: "Charged if the van is returned in unsatisfactory condition." },
  { icon: Fuel,        title: "Refueling Fee",   value: "$30",      desc: "Charged if the fuel level is lower than at pickup." },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero */}
      <div className="bg-[#111827] border-b border-[#1f2937] py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-14 h-14 bg-[#1e3a5f] border border-[#2563eb]/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <DollarSign size={26} className="text-[#60a5fa]" />
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-3">Simple Pricing</h1>
          <p className="text-[#6b7280] max-w-lg mx-auto">
            No contracts, no hidden fees. One flat hourly rate — that's it.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: pricing info */}
          <div className="space-y-6">
            {/* Main rate */}
            <div className="rounded-2xl bg-[#1e3a5f] border border-[#2563eb]/30 p-8 text-center">
              <div className="text-6xl font-black text-white mb-2">$17</div>
              <div className="text-[#93c5fd] text-lg font-semibold mb-1">per hour</div>
              <div className="text-[#7cb3f0] text-sm">All van sizes · No mileage fees</div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/10 p-3 text-center">
                  <Shield size={20} className="mx-auto text-[#60a5fa] mb-1" />
                  <div className="text-white font-bold">$4</div>
                  <div className="text-xs text-[#93c5fd]">Insurance (fixed)</div>
                </div>
                <div className="rounded-xl bg-white/10 p-3 text-center">
                  <Clock size={20} className="mx-auto text-[#60a5fa] mb-1" />
                  <div className="text-white font-bold">2h min</div>
                  <div className="text-xs text-[#93c5fd]">Minimum rental</div>
                </div>
              </div>
            </div>

            {/* What's included */}
            <div className="rounded-2xl bg-[#111827] border border-[#1f2937] p-6">
              <h3 className="text-white font-bold text-lg mb-4">What's included</h3>
              <ul className="space-y-2.5">
                {inclusions.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-[#d1d5db]">
                    <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Fuel policy */}
            <div className="rounded-2xl bg-[#111827] border border-[#1f2937] p-6">
              <h3 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
                <Fuel size={18} className="text-orange-400" />
                Fuel Policy
              </h3>
              <p className="text-[#9ca3af] text-sm leading-relaxed">
                Return the van with the same fuel level as when you received it (full tank). A $30 refueling fee applies if the tank is not full upon return.
              </p>
            </div>
          </div>

          {/* Right: calculator + extras */}
          <div className="space-y-6">
            <QuickCalculator />

            {/* Additional fees */}
            <div className="rounded-2xl bg-[#111827] border border-[#1f2937] p-6">
              <h3 className="text-white font-bold text-lg mb-4">Additional Fees</h3>
              <div className="space-y-4">
                {extras.map((item) => (
                  <div key={item.title} className="flex items-start gap-4 p-4 rounded-xl bg-[#1f2937]">
                    <div className="w-10 h-10 bg-[#374151] rounded-xl flex items-center justify-center flex-shrink-0">
                      <item.icon size={18} className="text-orange-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-white font-semibold text-sm">{item.title}</span>
                        <span className="text-orange-400 font-bold text-sm flex-shrink-0">{item.value}</span>
                      </div>
                      <p className="text-[#6b7280] text-xs mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Taxes note */}
            <div className="rounded-2xl bg-[#1f2937] border border-[#374151] p-5">
              <h3 className="text-white font-semibold text-sm mb-2">State Taxes</h3>
              <p className="text-[#9ca3af] text-xs leading-relaxed">
                Sales tax is calculated automatically based on your rental location. Texas rate is 8.25%. Tax is applied to the subtotal (rental + insurance). You'll see the exact breakdown before confirming your booking.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
