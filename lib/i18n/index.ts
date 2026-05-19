"use client";

import en from "./en";
import fr from "./fr";
import es from "./es";
import type { Translations } from "./en";

export type Locale = "en" | "fr" | "es";

export const LOCALES: { code: Locale; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "es", label: "Español", flag: "🇲🇽" },
];

const translations: Record<Locale, Translations> = { en, fr, es };

export function getTranslations(locale: Locale): Translations {
  return translations[locale] ?? translations.en;
}

export type { Translations };
