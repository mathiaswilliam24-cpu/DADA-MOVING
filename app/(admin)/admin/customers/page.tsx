import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const customers = await db.user.findMany({
    where: { role: "CUSTOMER" },
    select: {
      id: true, name: true, email: true, phone: true, isActive: true, createdAt: true,
      _count: { select: { bookings: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Customers</h1>
        <p className="text-[#6b7280] text-sm mt-0.5">{customers.length} registered customers</p>
      </div>

      <div className="rounded-2xl bg-[#111827] border border-[#1f2937] overflow-hidden">
        {customers.length === 0 ? (
          <div className="text-center py-16">
            <Users size={32} className="mx-auto text-[#374151] mb-3" />
            <p className="text-[#6b7280]">No customers yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1f2937]">
                  {["Customer", "Email", "Phone", "Bookings", "Joined", "Status"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-b border-[#1f2937] hover:bg-[#1f2937]/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#1e3a5f] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {c.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <span className="text-white font-medium">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#9ca3af]">{c.email}</td>
                    <td className="px-4 py-3 text-[#9ca3af]">{c.phone || <span className="text-[#4b5563]">—</span>}</td>
                    <td className="px-4 py-3">
                      <span className="text-white font-semibold">{c._count.bookings}</span>
                    </td>
                    <td className="px-4 py-3 text-[#9ca3af] text-xs">{formatDate(c.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.isActive ? "text-green-400 bg-green-900/20 border border-green-700/30" : "text-red-400 bg-red-900/20 border border-red-700/30"}`}>
                        {c.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
