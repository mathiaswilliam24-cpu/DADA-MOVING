"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
  { q: "What is included in the $17/hour rate?", a: "The $17/hour rate covers the full van rental with unlimited mileage. You also pay a fixed $4 insurance fee per booking plus applicable state taxes. No hidden fees." },
  { q: "Is there a minimum rental period?", a: "Yes, the minimum rental is 2 hours. There is no maximum — rent for as long as you need." },
  { q: "What are the fuel policies?", a: "You receive the van with a full tank and must return it full. If not, a $30 refueling fee applies." },
  { q: "What documents do I need to rent?", a: "You need a valid US driver's license (uploaded during booking), a credit/debit card, and must be at least 21 years old." },
  { q: "Can I use the van for long-distance moves?", a: "Yes! Since there are no mileage fees, you can drive anywhere you need. The rate is simply $17 per hour regardless of distance." },
  { q: "What happens if I return the van late?", a: "A late return fee of $25/hour applies if you keep the van beyond your booked return time. You can extend your booking online if needed." },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full uppercase tracking-wider mb-3">FAQ</span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#0f172a] mb-3">Common Questions</h2>
          <p className="text-[#64748b]">Everything you need to know about renting with DADA MOVING.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-2xl border border-[#e2e8f0] overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left bg-white hover:bg-[#f8fafc] transition-colors"
              >
                <span className="text-[#0f172a] font-semibold text-sm sm:text-base">{faq.q}</span>
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#f1f5f9] flex items-center justify-center text-[#1e3a8a]">
                  {open === i ? <Minus size={14} /> : <Plus size={14} />}
                </span>
              </button>
              {open === i && (
                <div className="px-6 py-4 bg-[#f8fafc] border-t border-[#e2e8f0] text-[#475569] text-sm leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
