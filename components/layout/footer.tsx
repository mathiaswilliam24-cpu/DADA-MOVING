import Link from "next/link";
import { Truck, MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0f172a] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 bg-[#f59e0b] rounded-xl flex items-center justify-center">
                <Truck size={20} className="text-white" />
              </div>
              <div>
                <div className="font-black text-white text-lg leading-none">DADA MOVING</div>
                <div className="text-[#94a3b8] text-xs mt-0.5">Van Rental Houston</div>
              </div>
            </div>
            <p className="text-[#94a3b8] text-sm leading-relaxed max-w-xs mb-5">
              Affordable van rental in Houston. Only $17.99/hour with no mileage fees. Move more, pay less.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-[#94a3b8]">
                <MapPin size={14} className="text-[#f59e0b]" /> Houston, TX
              </div>
              <div className="flex items-center gap-2 text-sm text-[#94a3b8]">
                <Phone size={14} className="text-[#f59e0b]" /> (713) 555-0000
              </div>
              <div className="flex items-center gap-2 text-sm text-[#94a3b8]">
                <Mail size={14} className="text-[#f59e0b]" /> info@dadamoving.com
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Services</h3>
            <ul className="space-y-2.5">
              {[
                { href: "/fleet",        label: "Our Vans" },
                { href: "/pricing",      label: "Pricing" },
                { href: "/how-it-works", label: "How It Works" },
                { href: "/booking",      label: "Book a Van" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-[#94a3b8] hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Account</h3>
            <ul className="space-y-2.5">
              {[
                { href: "/auth/login",    label: "Sign In" },
                { href: "/auth/register", label: "Create Account" },
                { href: "/dashboard",     label: "My Bookings" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-[#94a3b8] hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-[#1e293b] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#475569]">© {new Date().getFullYear()} DADA MOVING. All rights reserved.</p>
          <div className="flex items-center gap-2 text-xs text-[#475569]">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            $17.99/hr · No Mileage Fees · Fixed $4 Insurance
          </div>
        </div>
      </div>
    </footer>
  );
}
