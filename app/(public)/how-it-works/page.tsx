import Link from "next/link";
import { ArrowRight, Truck, CalendarDays, Upload, DollarSign, CreditCard, MapPin } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Truck,
    title: "Choose Your Van",
    description:
      "Browse our fleet of cargo and moving vans. Compare sizes, capacities, and features. All vans are clean, maintained, and GPS-ready.",
    detail: "From compact movers to large cargo vans — we have the right size for any job.",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
  },
  {
    number: "02",
    icon: CalendarDays,
    title: "Select Date and Time",
    description:
      "Pick your start and end time. The system automatically calculates the number of hours and shows you the exact price in real time.",
    detail: "Minimum 2 hours. No maximum. Book for as long as you need.",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    border: "border-purple-400/20",
  },
  {
    number: "03",
    icon: Upload,
    title: "Upload Driver's License",
    description:
      "Upload a photo of your valid US driver's license. You must be 21 or older to rent. Your information is kept secure.",
    detail: "Accepted formats: JPG, PNG, or PDF (max 8MB).",
    color: "text-green-400",
    bg: "bg-green-400/10",
    border: "border-green-400/20",
  },
  {
    number: "04",
    icon: DollarSign,
    title: "Review Price Including Taxes",
    description:
      "See a full, transparent breakdown: rental fee, $4 insurance, and state taxes based on your location — before you pay anything.",
    detail: "No hidden fees. No surprises. What you see is what you pay.",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/20",
  },
  {
    number: "05",
    icon: CreditCard,
    title: "Pay Online Securely",
    description:
      "Pay with any major credit or debit card via Stripe's secure payment system. Your payment information is never stored on our servers.",
    detail: "Visa, Mastercard, American Express, Discover accepted.",
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    border: "border-orange-400/20",
  },
  {
    number: "06",
    icon: MapPin,
    title: "Pick Up and Drive!",
    description:
      "Receive your confirmation email and SMS. Show up at the pickup location at your reserved time, verify your identity, and you're ready to go!",
    detail: "No mileage tracking. Drive as far as you need.",
    color: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-red-400/20",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero */}
      <div className="bg-[#111827] border-b border-[#1f2937] py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1e3a5f]/50 border border-[#2563eb]/30 rounded-full text-xs text-[#93c5fd] font-medium mb-4">
            Ready to move in 6 steps
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-3">How It Works</h1>
          <p className="text-[#6b7280] max-w-xl mx-auto">
            Renting a van with DADA MOVING is fast, simple, and completely transparent. Here's exactly what to expect.
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-6">
          {steps.map((step, i) => (
            <div key={step.number} className="relative">
              {/* Connector */}
              {i < steps.length - 1 && (
                <div className="absolute left-[35px] top-[80px] w-0.5 h-8 bg-[#1f2937]" />
              )}
              <div className={`rounded-2xl bg-[#111827] border ${step.border} p-6`}>
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 ${step.bg} border ${step.border} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                    <step.icon size={24} className={step.color} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-bold text-[#4b5563] font-mono">{step.number}</span>
                      <h2 className="text-white font-bold text-lg">{step.title}</h2>
                    </div>
                    <p className="text-[#9ca3af] text-sm leading-relaxed mb-2">{step.description}</p>
                    <p className="text-xs text-[#4b5563] italic">{step.detail}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-[#6b7280] mb-6">Ready to start? It only takes 3 minutes.</p>
          <Link
            href="/booking"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/30 group"
          >
            Book a Van Now
            <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
