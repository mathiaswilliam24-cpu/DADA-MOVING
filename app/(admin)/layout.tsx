import { auth } from "@/auth";
import { redirect } from "next/navigation";
import NextAuthProvider from "@/components/layout/session-provider";
import Link from "next/link";
import { Truck, BarChart3, CalendarCheck, Users, Settings, ShieldCheck, LogOut } from "lucide-react";
import { signOut } from "@/auth";

const navItems = [
  { href: "/admin",           icon: BarChart3,    label: "Dashboard" },
  { href: "/admin/vans",      icon: Truck,         label: "Fleet" },
  { href: "/admin/bookings",  icon: CalendarCheck, label: "Bookings" },
  { href: "/admin/customers", icon: Users,         label: "Customers" },
  { href: "/admin/settings",  icon: Settings,      label: "Settings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/auth/login");

  return (
    <NextAuthProvider>
      <div className="min-h-screen bg-[#f8fafc] flex">
        {/* Sidebar */}
        <aside className="w-60 flex-shrink-0 bg-[#1e3a8a] flex flex-col min-h-screen shadow-xl">
          <div className="px-5 py-5 border-b border-blue-800/50">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-[#f59e0b] rounded-xl flex items-center justify-center">
                <Truck size={18} className="text-white" />
              </div>
              <div>
                <div className="font-black text-white text-sm">DADA MOVING</div>
                <div className="text-blue-300 text-xs">Admin Panel</div>
              </div>
            </Link>
          </div>

          <nav className="flex-1 px-3 py-5 space-y-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-blue-200 hover:text-white hover:bg-white/10 transition-colors">
                <item.icon size={16} />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="px-3 pb-5 border-t border-blue-800/50 pt-4">
            <div className="flex items-center gap-2.5 px-3 py-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-[#f59e0b] flex items-center justify-center text-white text-xs font-black">
                {session.user.name?.[0] || "A"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white truncate">{session.user.name}</div>
                <div className="text-xs text-blue-300 truncate">{session.user.email}</div>
              </div>
            </div>
            <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
              <button type="submit" className="flex items-center gap-2 px-3 py-2 w-full text-xs text-red-300 hover:bg-white/10 rounded-lg transition-colors">
                <LogOut size={13} /> Sign Out
              </button>
            </form>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </NextAuthProvider>
  );
}
