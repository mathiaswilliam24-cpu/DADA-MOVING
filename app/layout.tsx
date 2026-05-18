import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DADA MOVING — Van Rental Houston | $17/Hour No Mileage Fees",
  description: "Rent a van in Houston for only $17/hour. No mileage fees, fixed $4 insurance, transparent pricing. Book online in minutes.",
  keywords: ["van rental Houston", "moving van Houston", "cargo van rental", "no mileage fee"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#f8fafc] text-[#0f172a]">
        {children}
      </body>
    </html>
  );
}
