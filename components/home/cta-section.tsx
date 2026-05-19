import Link from "next/link";
import { ArrowRight, Truck } from "lucide-react";

export default function CTASection() {
  return (
    <section className="py-20 bg-[#1e3a8a] relative overflow-hidden">
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E\")" }}
      />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="w-16 h-16 bg-[#f59e0b] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
          <Truck size={30} className="text-white" />
        </div>
        <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">Ready to move?</h2>
        <p className="text-xl text-blue-200 font-semibold mb-2">Rent a Van for Only $17.99/Hour — No Mileage Fees.</p>
        <p className="text-blue-300 mb-10 max-w-xl mx-auto">No surprise charges. No hidden fees. Perfect for moving, deliveries, furniture pickup, and small business use.</p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/booking" className="inline-flex items-center gap-2 px-10 py-4 bg-[#f59e0b] hover:bg-[#d97706] text-white font-black text-lg rounded-2xl transition-all shadow-2xl group">
            Book a Van Now <ArrowRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link href="/fleet" className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 border-2 border-white/30 text-white font-bold rounded-2xl transition-all">
            View Our Fleet
          </Link>
        </div>

        <div className="mt-10 flex items-center justify-center gap-8 text-sm text-blue-300">
          <span>✓ No contracts</span>
          <span>✓ No commitments</span>
          <span>✓ Book in 3 minutes</span>
        </div>
      </div>
    </section>
  );
}
