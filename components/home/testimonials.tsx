import { Star } from "lucide-react";

const testimonials = [
  { name: "Marcus T.", location: "Houston, TX", rating: 5, text: "Used DADA MOVING to move my apartment. The $17/hour rate with no mileage fees saved me so much. I took my time and paid less than any other service.", initials: "MT", bg: "bg-blue-600" },
  { name: "Sarah K.",  location: "Katy, TX",    rating: 5, text: "Booked online in 2 minutes. Van was ready when I arrived. The price breakdown was crystal clear — no surprises at checkout. Will use again!", initials: "SK", bg: "bg-amber-500" },
  { name: "David R.",  location: "Sugar Land",  rating: 5, text: "I use DADA MOVING for my business deliveries weekly. No mileage fees make it perfect. Fixed insurance keeps my costs predictable.", initials: "DR", bg: "bg-green-600" },
  { name: "Aisha M.",  location: "The Woodlands",rating: 5, text: "Helped move furniture from IKEA. The cargo van was huge and spotless. Customer service was great and booking was so simple.", initials: "AM", bg: "bg-purple-600" },
  { name: "James L.",  location: "Pasadena, TX", rating: 5, text: "Best moving experience I've had. Most transparent pricing I've ever seen for a rental. Zero hidden fees. Highly recommend.", initials: "JL", bg: "bg-red-500" },
  { name: "Priya S.",  location: "Pearland, TX", rating: 5, text: "Rented for a dorm move. The compact van was easy to drive. The $4 insurance was a pleasant surprise — so affordable!", initials: "PS", bg: "bg-teal-600" },
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-1 mb-3">
            {[1,2,3,4,5].map(i => <Star key={i} size={20} className="text-[#f59e0b] fill-[#f59e0b]" />)}
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#0f172a] mb-2">Trusted by Houston movers</h2>
          <p className="text-[#64748b]">Real reviews from real customers.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-white p-6 rounded-2xl border border-[#e2e8f0] hover:shadow-lg transition-shadow">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} size={14} className="text-[#f59e0b] fill-[#f59e0b]" />
                ))}
              </div>
              <p className="text-[#334155] text-sm leading-relaxed mb-5">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${t.bg} rounded-full flex items-center justify-center text-white text-sm font-bold`}>
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-bold text-[#0f172a]">{t.name}</div>
                  <div className="text-xs text-[#64748b]">{t.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
