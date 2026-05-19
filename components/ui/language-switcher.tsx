"use client";

import { useState } from "react";
import { useLanguage } from "@/components/providers/language-provider";
import { LOCALES, type Locale } from "@/lib/i18n";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LanguageSwitcher({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);

  const current = LOCALES.find(l => l.code === locale) || LOCALES[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors",
          variant === "dark"
            ? "bg-[#1f2937] hover:bg-[#374151] text-white border border-[#374151]"
            : "bg-white hover:bg-[#f1f5f9] text-[#0f172a] border border-[#e2e8f0]"
        )}
        aria-label="Select language"
      >
        <span>{current.flag}</span>
        <span className="hidden sm:block">{current.code.toUpperCase()}</span>
        <ChevronDown size={14} className={open ? "rotate-180" : ""} style={{ transition: "transform 0.2s" }} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className={cn(
            "absolute right-0 top-full mt-2 w-40 rounded-xl overflow-hidden shadow-xl z-50 border",
            variant === "dark"
              ? "bg-[#1f2937] border-[#374151]"
              : "bg-white border-[#e2e8f0]"
          )}>
            {LOCALES.map((loc) => (
              <button
                key={loc.code}
                onClick={() => { setLocale(loc.code as Locale); setOpen(false); }}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 w-full text-left text-sm transition-colors",
                  locale === loc.code
                    ? variant === "dark"
                      ? "bg-[#2563eb] text-white font-bold"
                      : "bg-[#1e3a8a] text-white font-bold"
                    : variant === "dark"
                      ? "text-white hover:bg-[#374151]"
                      : "text-[#0f172a] hover:bg-[#f8fafc]"
                )}
              >
                <span>{loc.flag}</span>
                <span>{loc.label}</span>
                {locale === loc.code && <span className="ml-auto text-xs">✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
