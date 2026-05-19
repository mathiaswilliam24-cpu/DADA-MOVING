"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Menu, X, Truck, User, LogOut, LayoutDashboard, ShieldCheck, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import LanguageSwitcher from "@/components/ui/language-switcher";
import { useLanguage } from "@/components/providers/language-provider";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const { t } = useLanguage();

  const navLinks = [
    { href: "/fleet",        label: t.nav.ourVans },
    { href: "/pricing",      label: t.nav.pricing },
    { href: "/how-it-works", label: t.nav.howItWorks },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#e2e8f0] shadow-sm">
      {/* Top bar */}
      <div className="bg-[#1e3a8a] text-white text-xs py-1.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-[#f59e0b] rounded-full animate-pulse" />
            Houston, TX — Available Now
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <Phone size={11} />
              (713) 555-0000
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group" onClick={() => setOpen(false)}>
            <div className="w-10 h-10 bg-[#1e3a8a] rounded-xl flex items-center justify-center group-hover:bg-[#1e2f6b] transition-colors shadow-md">
              <Truck size={20} className="text-white" />
            </div>
            <div className="leading-tight">
              <div className="font-black text-[#1e3a8a] text-xl tracking-tight">DADA</div>
              <div className="font-black text-[#f59e0b] text-xl tracking-tight -mt-1">MOVING</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
                  pathname === link.href
                    ? "text-[#1e3a8a] bg-blue-50"
                    : "text-[#475569] hover:text-[#1e3a8a] hover:bg-blue-50"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA + Account */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher variant="light" />
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setDropOpen(!dropOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#e2e8f0] hover:border-[#1e3a8a] transition-colors text-sm text-[#0f172a] font-medium"
                >
                  <div className="w-7 h-7 rounded-full bg-[#1e3a8a] flex items-center justify-center text-white text-xs font-bold">
                    {session.user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="max-w-[100px] truncate">{session.user?.name?.split(" ")[0]}</span>
                </button>
                {dropOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-[#e2e8f0] rounded-xl shadow-lg overflow-hidden z-50">
                    {session.user?.role === "ADMIN" ? (
                      <Link href="/admin" onClick={() => setDropOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-[#0f172a] hover:bg-[#f8fafc]">
                        <ShieldCheck size={16} className="text-[#1e3a8a]" /> Admin Dashboard
                      </Link>
                    ) : session.user?.role === "DRIVER" ? (
                      <Link href="/driver" onClick={() => setDropOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-[#0f172a] hover:bg-[#f8fafc]">
                        <Truck size={16} className="text-[#f59e0b]" /> Driver Dashboard
                      </Link>
                    ) : (
                      <Link href="/dashboard" onClick={() => setDropOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-[#0f172a] hover:bg-[#f8fafc]">
                        <LayoutDashboard size={16} className="text-[#1e3a8a]" /> My Dashboard
                      </Link>
                    )}
                    <div className="h-px bg-[#e2e8f0]" />
                    <button onClick={() => { signOut({ callbackUrl: "/" }); setDropOpen(false); }} className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 w-full text-left">
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/login" className="text-sm font-semibold text-[#475569] hover:text-[#1e3a8a] transition-colors">
                Sign In
              </Link>
            )}
            <Link
              href="/booking"
              className="px-5 py-2.5 bg-[#f59e0b] hover:bg-[#d97706] text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-amber-200"
            >
              Book a Van →
            </Link>
          </div>

          {/* Mobile button */}
          <button className="md:hidden p-2 rounded-lg text-[#475569] hover:bg-[#f1f5f9]" onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-[#e2e8f0] bg-white">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}
                className="block px-4 py-3 rounded-lg text-sm font-semibold text-[#475569] hover:text-[#1e3a8a] hover:bg-blue-50">
                {link.label}
              </Link>
            ))}
            <div className="h-px bg-[#e2e8f0] my-2" />
            <div className="flex items-center gap-2 px-4 py-2">
              <span className="text-xs text-[#94a3b8]">Language:</span>
              <LanguageSwitcher variant="light" />
            </div>
            <Link href="/booking" onClick={() => setOpen(false)} className="block px-4 py-3 bg-[#f59e0b] text-white text-sm font-bold rounded-xl text-center">
              {t.nav.bookNow}
            </Link>
            {session ? (
              <>
                <Link href={session.user?.role === "ADMIN" ? "/admin" : "/dashboard"} onClick={() => setOpen(false)} className="block px-4 py-3 text-sm text-[#475569] hover:bg-[#f1f5f9] rounded-lg">
                  {session.user?.role === "ADMIN" ? t.nav.adminDashboard : t.nav.myDashboard}
                </Link>
                <button onClick={() => { signOut({ callbackUrl: "/" }); setOpen(false); }} className="block px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg w-full text-left">
                  {t.nav.signOut}
                </button>
              </>
            ) : (
              <Link href="/auth/login" onClick={() => setOpen(false)} className="block px-4 py-3 text-sm text-[#475569] hover:bg-[#f1f5f9] rounded-lg">
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
