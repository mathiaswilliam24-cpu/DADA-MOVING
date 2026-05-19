"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, CheckCircle2, MapPin } from "lucide-react";
import { PriceTag } from "@/components/ui/price-tag";

export default function Hero() {
  const [location, setLocation] = useState("");

  return (
    <section className="relative bg-[#1e3a8a] overflow-hidden">
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#f59e0b]/20 border border-[#f59e0b]/40 rounded-full text-sm text-[#fcd34d] font-semibold mb-6">
              <span className="w-2 h-2 bg-[#f59e0b] rounded-full animate-pulse" />
              Available Now in Houston, TX
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-4">
              Rent a Van for Only
              <span className="block mt-1">
                <PriceTag size="xl" />
                <span className="text-white text-3xl font-black">/Hour</span>
              </span>
            </h1>

            <p className="text-xl text-blue-200 mb-6 leading-relaxed">
              No mileage fees. Fixed $4 insurance. Transparent pricing. Easy online booking.
            </p>

            <div className="flex flex-wrap gap-3 mb-8">
              {["No mileage fees", "Fixed $4 insurance", "No hidden charges", "Fast pickup"].map((b) => (
                <span key={b} className="flex items-center gap-1.5 text-sm text-blue-100 bg-white/10 px-3 py-1.5 rounded-full">
                  <CheckCircle2 size={13} className="text-[#f59e0b]" />
                  {b}
                </span>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-2xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-[#f59e0b] rounded-full" />
                <span className="text-sm font-bold text-[#0f172a]">Quick Booking</span>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
                  <input
                    type="text"
                    placeholder="Pickup location in Houston..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-9 pr-3 py-3 rounded-xl border border-[#e2e8f0] text-sm text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                  />
                </div>
                <Link
                  href={`/booking${location ? `?location=${encodeURIComponent(location)}` : ""}`}
                  className="flex items-center gap-2 px-5 py-3 bg-[#f59e0b] hover:bg-[#d97706] text-white text-sm font-bold rounded-xl transition-all whitespace-nowrap shadow-lg shadow-amber-300/30"
                >
                  Book Now <ArrowRight size={15} />
                </Link>
              </div>
              <p className="text-xs text-[#94a3b8] mt-2 text-center">Starting from $17.99/hr · Minimum 2 hours</p>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1566933293069-b55c7f326dd4?w=700&q=85"
                alt="DADA MOVING Van"
                className="w-full h-[420px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1e3a8a]/40 to-transparent" />
            </div>

            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl font-black text-green-600">$0</span>
              </div>
              <div>
                <div className="font-bold text-[#0f172a] text-sm">Mileage Fees</div>
                <div className="text-xs text-[#64748b]">Drive anywhere, freely</div>
              </div>
            </div>

            <div className="absolute -top-4 -right-4 bg-[#f59e0b] rounded-2xl shadow-xl p-4 text-center">
              <PriceTag size="md" />
              <div className="text-xs text-amber-100 font-semibold mt-1">per hour</div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 40L1440 40L1440 20C1440 20 1080 0 720 0C360 0 0 20 0 20L0 40Z" fill="#f8fafc"/>
        </svg>
      </div>
    </section>
  );
}
