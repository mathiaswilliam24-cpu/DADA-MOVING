import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import NextAuthProvider from "@/components/layout/session-provider";
import Link from "next/link";
import { LayoutDashboard, User, Truck } from "lucide-react";
import WhatsAppButton from "@/components/ui/whatsapp-button";

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "My Bookings" },
    { href: "/profile",   icon: User,            label: "Profile" },
    { href: "/booking",   icon: Truck,            label: "Book a Van" },
  ];

  return (
    <NextAuthProvider>
      <Header />
      <div className="min-h-screen bg-[#0a0a0a]">
        {/* Sub-nav */}
        <div className="bg-[#111827] border-b border-[#1f2937]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-1 overflow-x-auto py-0 no-scrollbar">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 px-4 py-3.5 text-sm font-medium text-[#6b7280] hover:text-white whitespace-nowrap border-b-2 border-transparent hover:border-[#2563eb] transition-colors"
                >
                  <item.icon size={15} />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {children}
        </main>
      </div>
      <Footer />
      <WhatsAppButton />
    </NextAuthProvider>
  );
}
