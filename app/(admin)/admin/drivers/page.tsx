"use client";

import { useState, useEffect } from "react";
import { Truck, Plus, Loader2, User, Phone, Mail, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Driver {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  _count: { driverBookings: number };
}

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fetchDrivers = async () => {
    const res = await fetch("/api/admin/drivers");
    if (res.ok) setDrivers(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchDrivers(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch("/api/admin/drivers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "Failed to create driver");
    } else {
      setSuccess(true);
      setForm({ name: "", email: "", phone: "", password: "" });
      await fetchDrivers();
      setTimeout(() => { setSuccess(false); setShowForm(false); }, 2000);
    }
    setSaving(false);
  };

  const inputCls = "w-full px-4 py-3 rounded-xl bg-[#0a0a0a] border border-[#374151] text-white placeholder-[#4b5563] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent text-sm";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Truck size={22} className="text-[#f59e0b]" /> Driver Management
          </h1>
          <p className="text-[#6b7280] text-sm mt-0.5">{drivers.length} driver{drivers.length !== 1 ? "s" : ""} registered</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#f59e0b] hover:bg-[#d97706] text-white text-sm font-bold rounded-xl">
          <Plus size={16} /> Add Driver
        </button>
      </div>

      {/* Add Driver Form */}
      {showForm && (
        <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-6 mb-6">
          <h2 className="text-white font-bold mb-4">Create New Driver Account</h2>
          {success ? (
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle2 size={16} /> Driver created successfully!
            </div>
          ) : (
            <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#d1d5db] mb-1">Full Name *</label>
                <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required className={inputCls} placeholder="John Smith" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#d1d5db] mb-1">Email *</label>
                <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required className={inputCls} placeholder="driver@dadamoving.com" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#d1d5db] mb-1">Phone</label>
                <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className={inputCls} placeholder="+1 (713) 555-0000" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#d1d5db] mb-1">Password *</label>
                <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required className={inputCls} placeholder="Min. 8 characters" />
              </div>
              {error && <div className="sm:col-span-2 text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-xl px-3 py-2">{error}</div>}
              <div className="sm:col-span-2 flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-[#374151] rounded-xl text-sm text-[#9ca3af]">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-[#2563eb] text-white font-bold rounded-xl text-sm disabled:opacity-60 flex items-center justify-center gap-2">
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {saving ? "Creating..." : "Create Driver"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Driver list */}
      {loading ? (
        <div className="text-center py-20"><Loader2 size={24} className="animate-spin mx-auto text-[#6b7280]" /></div>
      ) : drivers.length === 0 ? (
        <div className="text-center py-16 rounded-2xl bg-[#111827] border border-[#1f2937]">
          <Truck size={36} className="mx-auto text-[#374151] mb-3" />
          <p className="text-white font-semibold mb-1">No drivers yet</p>
          <p className="text-[#6b7280] text-sm">Create your first driver account above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {drivers.map((driver) => (
            <div key={driver.id} className="bg-[#111827] border border-[#1f2937] rounded-2xl p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#f59e0b] flex items-center justify-center text-white text-xl font-black flex-shrink-0">
                  {driver.name?.[0]?.toUpperCase() || "D"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-white font-bold">{driver.name}</span>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium",
                      driver.isActive ? "text-green-400 bg-green-900/30" : "text-red-400 bg-red-900/30")}>
                      {driver.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#9ca3af] mb-0.5">
                    <Mail size={11} /> {driver.email}
                  </div>
                  {driver.phone && (
                    <div className="flex items-center gap-1.5 text-xs text-[#9ca3af]">
                      <Phone size={11} /> {driver.phone}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#1f2937] flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-[#6b7280]">
                  <Truck size={12} className="text-[#f59e0b]" />
                  {driver._count.driverBookings} deliveries assigned
                </div>
                <span className="text-xs text-[#4b5563] font-mono">{driver.id.slice(-8)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
