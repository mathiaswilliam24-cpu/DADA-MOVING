import { auth } from "@/auth";
import { redirect } from "next/navigation";
import NextAuthProvider from "@/components/layout/session-provider";
import Link from "next/link";
import { Truck, LayoutDashboard, ClipboardList, User, LogOut } from "lucide-react";
import { signOut } from "@/auth";

export default async function DriverLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "DRIVER") {
    redirect("/auth/login");
  }

  return (
    <NextAuthProvider>
      <div className="min-h-screen bg-[#f8fafc] flex flex-col">
        {/* Top Nav — mobile optimized */}
        <header className="bg-[#1e3a8a] text-white shadow-lg sticky top-0 z-50">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-[#f59e0b] rounded-xl flex items-center justify-center">
                <Truck size={18} className="text-white" />
              </div>
              <div>
                <div className="font-black text-sm leading-none">DADA MOVING</div>
                <div className="text-blue-300 text-xs">Driver Portal</div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-blue-200">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              {session.user.name?.split(" ")[0]}
            </div>
          </div>

          {/* Bottom nav tabs */}
          <div className="max-w-2xl mx-auto px-4 flex border-t border-blue-800/50">
            {[
              { href: "/driver", icon: LayoutDashboard, label: "Dashboard" },
              { href: "/driver/deliveries", icon: ClipboardList, label: "Deliveries" },
              { href: "/driver/profile", icon: User, label: "Profile" },
            ].map((item) => (
              <Link key={item.href} href={item.href}
                className="flex-1 flex flex-col items-center gap-1 py-2.5 text-blue-200 hover:text-white transition-colors text-xs font-medium">
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
            <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }} className="flex-1">
              <button type="submit" className="w-full flex flex-col items-center gap-1 py-2.5 text-blue-200 hover:text-red-300 transition-colors text-xs font-medium">
                <LogOut size={18} />
                Sign Out
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
          {children}
        </main>
      </div>
    </NextAuthProvider>
  );
}
