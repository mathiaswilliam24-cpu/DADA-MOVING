import { formatCurrency } from "@/lib/utils";
import { DollarSign, CalendarCheck, Users, Truck } from "lucide-react";

interface Stats {
  todayRevenue: number; todayBookings: number;
  monthRevenue: number; monthBookings: number;
  yearRevenue: number;  yearBookings: number;
  totalRevenue: number; totalBookings: number;
  totalCustomers: number; activeVans: number;
}

interface CardProps {
  title: string; value: string; sub?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string; bg: string; border: string;
}

function StatCard({ title, value, sub, icon: Icon, color, bg, border }: CardProps) {
  return (
    <div className={`p-5 rounded-2xl bg-white border ${border} shadow-sm`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-1">{title}</p>
          <p className="text-2xl font-black text-[#0f172a]">{value}</p>
          {sub && <p className="text-xs text-[#94a3b8] mt-0.5">{sub}</p>}
        </div>
        <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
          <Icon size={22} className={color} />
        </div>
      </div>
    </div>
  );
}

export default function StatsCards({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Revenue Today"       value={formatCurrency(stats.todayRevenue)}  sub={`${stats.todayBookings} booking${stats.todayBookings !== 1 ? "s" : ""}`} icon={DollarSign}    color="text-green-600"  bg="bg-green-100"  border="border-green-200" />
      <StatCard title="Revenue This Month"  value={formatCurrency(stats.monthRevenue)}  sub={`${stats.monthBookings} bookings`} icon={CalendarCheck} color="text-blue-600"   bg="bg-blue-100"   border="border-blue-200" />
      <StatCard title="Total Customers"     value={stats.totalCustomers.toLocaleString()} sub="registered accounts" icon={Users}          color="text-purple-600" bg="bg-purple-100" border="border-purple-200" />
      <StatCard title="Active Fleet"        value={`${stats.activeVans} vans`}          sub="available now"      icon={Truck}          color="text-amber-600"  bg="bg-amber-100"  border="border-amber-200" />
    </div>
  );
}
