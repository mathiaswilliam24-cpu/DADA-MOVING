import { db } from "@/lib/db";
import VanCard from "@/components/fleet/van-card";
import { Truck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function FleetPage() {
  const vans = await db.van.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero */}
      <div className="bg-[#111827] border-b border-[#1f2937] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-14 h-14 bg-[#1e3a5f] border border-[#2563eb]/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Truck size={26} className="text-[#60a5fa]" />
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-3">Our Fleet</h1>
          <p className="text-[#6b7280] max-w-xl mx-auto">
            All vans available at <span className="text-white font-semibold">$17/hour</span> with{" "}
            <span className="text-green-400 font-semibold">no mileage fees</span> and a fixed{" "}
            <span className="text-white font-semibold">$4 insurance</span>. Choose the size that fits your move.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {vans.length === 0 ? (
          <div className="text-center py-20 text-[#6b7280]">No vans available at the moment. Check back soon.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
            {vans.map((van) => (
              <VanCard key={van.id} van={van} />
            ))}
          </div>
        )}

        {/* Bottom note */}
        <div className="mt-12 p-6 rounded-2xl bg-[#111827] border border-[#1f2937] text-center">
          <p className="text-[#6b7280] text-sm">
            All prices are <strong className="text-white">$17/hour</strong> with a{" "}
            <strong className="text-white">$4 fixed insurance</strong> fee. Minimum rental is 2 hours.{" "}
            <strong className="text-green-400">No mileage fees</strong> — ever.{" "}
            State taxes apply based on your rental location.
          </p>
        </div>
      </div>
    </div>
  );
}
