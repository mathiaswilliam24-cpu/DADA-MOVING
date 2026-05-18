"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface MonthlyData { month: string; revenue: number; bookings: number; }

export default function RevenueChart({ data }: { data: MonthlyData[] }) {
  const [view, setView] = useState<"revenue" | "bookings">("revenue");

  return (
    <div className="p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[#0f172a] font-black text-lg">Revenue Overview</h2>
          <p className="text-[#64748b] text-xs mt-0.5">Last 12 months</p>
        </div>
        <div className="flex items-center gap-1 bg-[#f1f5f9] p-1 rounded-xl">
          {(["revenue", "bookings"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-colors ${view === v ? "bg-[#1e3a8a] text-white shadow" : "text-[#64748b] hover:text-[#0f172a]"}`}>
              {v}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false}
            tickFormatter={(v) => view === "revenue" ? `$${v >= 1000 ? (v / 1000).toFixed(1) + "k" : v}` : String(v)} />
          <Tooltip
            contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", color: "#0f172a", boxShadow: "0 4px 24px rgba(0,0,0,.08)" }}
            formatter={(value) => {
              const v = Number(value ?? 0);
              return [view === "revenue" ? formatCurrency(v) : `${v} bookings`, view === "revenue" ? "Revenue" : "Bookings"] as [string, string];
            }}
            cursor={{ fill: "#f1f5f9" }}
          />
          <Bar dataKey={view} fill="#1e3a8a" radius={[6, 6, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
