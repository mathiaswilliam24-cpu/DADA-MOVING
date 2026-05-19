"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { getTranslations, type Locale, type Translations } from "@/lib/i18n";

const STORAGE_KEY = "dada-moving-locale";

interface LanguageContextType {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: "en",
  t: getTranslations("en"),
  setLocale: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved && ["en", "fr", "es"].includes(saved)) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
    document.cookie = `locale=${newLocale};path=/;max-age=31536000`;
  };

  return (
    <LanguageContext.Provider value={{ locale, t: getTranslations(locale), setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
