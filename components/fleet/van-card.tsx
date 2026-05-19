import Link from "next/link";
import { Users, Package, ArrowRight, CheckCircle2 } from "lucide-react";
import { PriceTag } from "@/components/ui/price-tag";

interface Van {
  id: string; name: string; description?: string | null;
  seats: number; cargoCapacity: string; imageUrl?: string | null;
  isAvailable: boolean; features: string[];
}

export default function VanCard({ van }: { van: Van }) {
  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden hover:shadow-xl hover:border-[#1e3a8a]/20 transition-all group">
      {/* Image */}
      <div className="relative h-56 bg-[#f1f5f9] overflow-hidden">
        {van.imageUrl ? (
          <img src={van.imageUrl} alt={van.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={48} className="text-[#cbd5e1]" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 bg-[#f59e0b] text-white text-xs font-black rounded-full shadow-md">NO MILEAGE FEE</span>
        </div>
        <div className="absolute top-3 right-3">
          <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${van.isAvailable ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"}`}>
            {van.isAvailable ? "Available" : "Unavailable"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-[#0f172a] font-black text-xl mb-1">{van.name}</h3>
        {van.description && <p className="text-[#64748b] text-sm leading-relaxed mb-4 line-clamp-2">{van.description}</p>}

        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5 text-sm text-[#475569]">
            <Users size={15} className="text-[#1e3a8a]" />
            {van.seats} seat{van.seats !== 1 ? "s" : ""}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-[#475569]">
            <Package size={15} className="text-[#1e3a8a]" />
            {van.cargoCapacity}
          </div>
        </div>

        {van.features.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {van.features.slice(0, 3).map((f) => (
              <span key={f} className="flex items-center gap-1 text-xs text-[#475569] bg-[#f1f5f9] px-2.5 py-1 rounded-full">
                <CheckCircle2 size={10} className="text-green-500" /> {f}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-[#f1f5f9]">
          <div>
            <div className="flex items-baseline gap-1">
              <PriceTag size="sm" lightMode />
              <span className="text-[#64748b] text-sm">/hour</span>
            </div>
            <div className="text-xs text-[#94a3b8]">+ $4 insurance · No mileage fee</div>
          </div>
          <Link
            href={van.isAvailable ? `/booking?van=${van.id}` : "#"}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              van.isAvailable
                ? "bg-[#f59e0b] hover:bg-[#d97706] text-white shadow-md shadow-amber-200"
                : "bg-[#f1f5f9] text-[#94a3b8] cursor-not-allowed"
            }`}
          >
            Reserve Now {van.isAvailable && <ArrowRight size={14} />}
          </Link>
        </div>
      </div>
    </div>
  );
}
