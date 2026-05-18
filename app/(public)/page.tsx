import Hero from "@/components/home/hero";
import Features from "@/components/home/features";
import Testimonials from "@/components/home/testimonials";
import FAQ from "@/components/home/faq";
import CTASection from "@/components/home/cta-section";
import Link from "next/link";
import { ArrowRight, Truck, Clock, CreditCard, CheckCircle2 } from "lucide-react";
import { db } from "@/lib/db";
import VanCard from "@/components/fleet/van-card";

async function getFeaturedVans() {
  return db.van.findMany({ where: { isAvailable: true }, take: 4, orderBy: { createdAt: "asc" } });
}

function HowItWorksStrip() {
  const steps = [
    { icon: Truck,      step: "1", title: "Choose your van",        desc: "Browse our fleet and pick the right size." },
    { icon: Clock,      step: "2", title: "Select date & time",     desc: "Pick your rental period. Minimum 2 hours." },
    { icon: CreditCard, step: "3", title: "Pay & go",               desc: "Secure Stripe payment, then pick up and drive." },
  ];

  return (
    <section className="py-16 bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="inline-block px-3 py-1 bg-blue-100 text-[#1e3a8a] text-xs font-bold rounded-full uppercase tracking-wider mb-3">Simple process</span>
          <h2 className="text-3xl font-black text-[#0f172a]">Ready in 3 steps</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {steps.map((s, i) => (
            <div key={i} className="relative bg-white p-6 rounded-2xl border border-[#e2e8f0] text-center shadow-sm">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#f59e0b] rounded-full flex items-center justify-center text-white font-black text-sm shadow-lg">
                {s.step}
              </div>
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mt-3 mb-4">
                <s.icon size={24} className="text-[#1e3a8a]" />
              </div>
              <h3 className="font-bold text-[#0f172a] mb-2">{s.title}</h3>
              <p className="text-[#64748b] text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Link href="/how-it-works" className="inline-flex items-center gap-1.5 text-sm text-[#1e3a8a] font-semibold hover:underline">
            See full process <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function PricingBanner() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#1e3a8a] rounded-3xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-8 md:p-10">
              <h2 className="text-3xl font-black text-white mb-2">Simple, honest pricing</h2>
              <p className="text-blue-200 mb-6">No contracts. No hidden fees. No mileage limits. Ever.</p>
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { value: "$17", label: "per hour", sub: "All vans" },
                  { value: "$4",  label: "insurance", sub: "Fixed fee" },
                  { value: "$0",  label: "mileage",   sub: "Free miles" },
                ].map((item) => (
                  <div key={item.label} className="bg-white/10 rounded-2xl p-4 text-center">
                    <div className="text-2xl font-black text-[#f59e0b]">{item.value}</div>
                    <div className="text-xs text-blue-200 font-semibold">{item.label}</div>
                    <div className="text-xs text-blue-300/60 mt-0.5">{item.sub}</div>
                  </div>
                ))}
              </div>
              <Link href="/booking" className="inline-flex items-center gap-2 px-6 py-3 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold rounded-xl transition-all">
                Book Now <ArrowRight size={16} />
              </Link>
            </div>
            <div className="hidden md:block relative">
              <img src="https://images.unsplash.com/photo-1566933293069-b55c7f326dd4?w=600&q=80" alt="Van" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#1e3a8a] to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default async function HomePage() {
  const vans = await getFeaturedVans();

  return (
    <>
      <Hero />
      <Features />
      <PricingBanner />
      <HowItWorksStrip />

      {/* Featured Vans */}
      <section className="py-16 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full uppercase tracking-wider mb-3">Our Fleet</span>
              <h2 className="text-3xl font-black text-[#0f172a]">Choose your van</h2>
            </div>
            <Link href="/fleet" className="text-sm font-semibold text-[#1e3a8a] hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {vans.map((van) => <VanCard key={van.id} van={van} />)}
          </div>
        </div>
      </section>

      <Testimonials />
      <FAQ />
      <CTASection />
    </>
  );
}
