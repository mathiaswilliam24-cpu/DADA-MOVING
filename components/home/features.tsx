import { Gauge, Shield, CreditCard, Zap, Clock, MapPin } from "lucide-react";

const features = [
  { icon: Gauge,      title: "No Mileage Fees",      desc: "Drive as many miles as you need. Our flat $17/hour rate covers unlimited mileage.", color: "bg-green-100 text-green-700" },
  { icon: Shield,     title: "Fixed $4 Insurance",    desc: "One flat insurance fee per rental. No variable rates, no complicated tiers.", color: "bg-blue-100 text-blue-700" },
  { icon: CreditCard, title: "Transparent Pricing",   desc: "See the full cost — rental, insurance, taxes — before you confirm. Zero surprises.", color: "bg-purple-100 text-purple-700" },
  { icon: Zap,        title: "Online Booking",        desc: "Reserve your van in under 3 minutes from any device. No phone calls needed.", color: "bg-amber-100 text-amber-700" },
  { icon: Clock,      title: "Fast Pickup",           desc: "Your van is ready when you arrive. Skip the long lines and paperwork.", color: "bg-orange-100 text-orange-700" },
  { icon: MapPin,     title: "Houston Based",         desc: "Serving greater Houston. Convenient locations across the city.", color: "bg-red-100 text-red-700" },
];

export default function Features() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-block px-3 py-1 bg-blue-100 text-[#1e3a8a] text-xs font-bold rounded-full uppercase tracking-wider mb-3">Why choose us</span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#0f172a] mb-3">Move more, pay less.</h2>
          <p className="text-[#64748b] max-w-xl mx-auto">DADA MOVING was built to be the most honest, affordable van rental service in Houston.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="p-6 rounded-2xl border border-[#e2e8f0] bg-white hover:shadow-lg hover:border-[#1e3a8a]/20 transition-all group">
              <div className={`w-12 h-12 ${f.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <f.icon size={22} />
              </div>
              <h3 className="text-[#0f172a] font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-[#64748b] text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
