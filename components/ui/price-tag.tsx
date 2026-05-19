import { cn } from "@/lib/utils";

interface PriceTagProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  lightMode?: boolean;
}

const sizes = {
  sm:  { dollar: "text-base",  main: "text-2xl",  cents: "text-sm"  },
  md:  { dollar: "text-lg",   main: "text-4xl",  cents: "text-base" },
  lg:  { dollar: "text-xl",   main: "text-5xl",  cents: "text-lg"  },
  xl:  { dollar: "text-2xl",  main: "text-7xl",  cents: "text-2xl" },
};

export function PriceTag({ size = "md", className, lightMode = false }: PriceTagProps) {
  const s = sizes[size];
  const textColor = lightMode ? "text-[#1e3a8a]" : "text-white";
  const centsColor = lightMode ? "text-[#f59e0b]" : "text-[#f59e0b]";

  return (
    <span className={cn("inline-flex items-start leading-none", className)}>
      <span className={cn("font-black mt-1.5", s.dollar, textColor)}>$</span>
      <span className={cn("font-black tracking-tight", s.main, textColor)}>17</span>
      <span className={cn("font-black mt-1", s.cents, centsColor)}>.99</span>
    </span>
  );
}

export function PricePerHour({ size = "md", className, lightMode = false }: PriceTagProps) {
  const s = sizes[size];
  const mutedColor = lightMode ? "text-[#64748b]" : "text-blue-200";

  return (
    <span className={cn("inline-flex items-baseline gap-0.5", className)}>
      <PriceTag size={size} lightMode={lightMode} />
      <span className={cn("font-semibold ml-0.5", s.cents, mutedColor)}>/hr</span>
    </span>
  );
}
