"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Loader2, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface Van {
  id: string;
  name: string;
  description?: string | null;
  seats: number;
  cargoCapacity: string;
  imageUrl?: string | null;
  isAvailable: boolean;
  features: string[];
}

interface VanFormData {
  name: string;
  description: string;
  seats: number;
  cargoCapacity: string;
  imageUrl: string;
  isAvailable: boolean;
  features: string;
}

function VanModal({
  van,
  onSave,
  onClose,
}: {
  van?: Van;
  onSave: (data: Partial<Van>) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<VanFormData>({
    name: van?.name || "",
    description: van?.description || "",
    seats: van?.seats || 2,
    cargoCapacity: van?.cargoCapacity || "",
    imageUrl: van?.imageUrl || "",
    isAvailable: van?.isAvailable ?? true,
    features: van?.features?.join(", ") || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave({
      ...form,
      features: form.features ? form.features.split(",").map(f => f.trim()).filter(Boolean) : [],
      imageUrl: form.imageUrl || undefined,
      description: form.description || undefined,
    });
    setSaving(false);
  };

  const inputCls = "w-full px-3 py-2.5 rounded-xl bg-[#0a0a0a] border border-[#374151] text-white placeholder-[#4b5563] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-colors text-sm";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur">
      <div className="bg-[#111827] border border-[#1f2937] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1f2937]">
          <h2 className="text-white font-bold">{van ? "Edit Van" : "Add New Van"}</h2>
          <button onClick={onClose} className="text-[#6b7280] hover:text-white transition-colors text-xl">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {[
            { label: "Van Name", field: "name", type: "text", placeholder: "Cargo Pro 150", required: true },
            { label: "Cargo Capacity", field: "cargoCapacity", type: "text", placeholder: "250 cu ft", required: true },
            { label: "Image URL", field: "imageUrl", type: "url", placeholder: "https://..." },
          ].map((f) => (
            <div key={f.field}>
              <label className="block text-xs font-medium text-[#d1d5db] mb-1">{f.label}</label>
              <input
                type={f.type}
                placeholder={f.placeholder}
                required={f.required}
                value={(form as unknown as Record<string, string>)[f.field]}
                onChange={(e) => setForm(p => ({ ...p, [f.field]: e.target.value }))}
                className={inputCls}
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-[#d1d5db] mb-1">Seats</label>
            <input
              type="number"
              min={1}
              max={15}
              value={form.seats}
              onChange={(e) => setForm(p => ({ ...p, seats: parseInt(e.target.value) || 2 }))}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#d1d5db] mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Van description..."
              value={form.description}
              onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
              className={cn(inputCls, "resize-none")}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#d1d5db] mb-1">Features (comma-separated)</label>
            <input
              type="text"
              placeholder="Loading ramp, GPS ready, Tie-down anchors"
              value={form.features}
              onChange={(e) => setForm(p => ({ ...p, features: e.target.value }))}
              className={inputCls}
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setForm(p => ({ ...p, isAvailable: !p.isAvailable }))}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                form.isAvailable ? "bg-green-900/30 text-green-400 border border-green-700/40" : "bg-[#1f2937] text-[#6b7280] border border-[#374151]"
              }`}
            >
              {form.isAvailable ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
              {form.isAvailable ? "Available" : "Unavailable"}
            </button>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#374151] text-sm text-[#9ca3af] hover:text-white transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? "Saving..." : van ? "Update Van" : "Add Van"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminVansPage() {
  const [vans, setVans] = useState<Van[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; van?: Van }>({ open: false });

  const fetchVans = async () => {
    const res = await fetch("/api/admin/vans");
    if (res.ok) setVans(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchVans(); }, []);

  const handleSave = async (van: Van | undefined, data: Partial<Van>) => {
    const url = van ? `/api/admin/vans/${van.id}` : "/api/admin/vans";
    const method = van ? "PATCH" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    await fetchVans();
    setModal({ open: false });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this van? This cannot be undone.")) return;
    await fetch(`/api/admin/vans/${id}`, { method: "DELETE" });
    await fetchVans();
  };

  const handleToggle = async (van: Van) => {
    await fetch(`/api/admin/vans/${van.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAvailable: !van.isAvailable }),
    });
    await fetchVans();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Fleet Management</h1>
          <p className="text-[#6b7280] text-sm mt-0.5">{vans.length} van{vans.length !== 1 ? "s" : ""} in fleet</p>
        </div>
        <button
          onClick={() => setModal({ open: true })}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Plus size={16} />
          Add Van
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-[#6b7280]"><Loader2 size={24} className="animate-spin mx-auto" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vans.map((van) => (
            <div key={van.id} className="rounded-2xl bg-[#111827] border border-[#1f2937] overflow-hidden">
              {van.imageUrl && (
                <div className="h-40 relative">
                  <img src={van.imageUrl} alt={van.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111827] to-transparent" />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-bold">{van.name}</h3>
                    <p className="text-[#6b7280] text-xs">{van.seats} seats · {van.cargoCapacity}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${van.isAvailable ? "text-green-400 bg-green-900/30 border border-green-700/40" : "text-red-400 bg-red-900/30 border border-red-700/40"}`}>
                    {van.isAvailable ? "Available" : "Unavailable"}
                  </span>
                </div>
                <div className="flex items-center gap-2 pt-3 border-t border-[#1f2937]">
                  <button onClick={() => setModal({ open: true, van })} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#9ca3af] hover:text-white bg-[#1f2937] hover:bg-[#374151] rounded-lg transition-colors">
                    <Edit2 size={12} /> Edit
                  </button>
                  <button onClick={() => handleToggle(van)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#9ca3af] hover:text-white bg-[#1f2937] hover:bg-[#374151] rounded-lg transition-colors">
                    {van.isAvailable ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
                    {van.isAvailable ? "Disable" : "Enable"}
                  </button>
                  <button onClick={() => handleDelete(van.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 hover:text-red-300 bg-red-900/20 hover:bg-red-900/40 rounded-lg transition-colors ml-auto">
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal.open && (
        <VanModal
          van={modal.van}
          onSave={(data) => handleSave(modal.van, data)}
          onClose={() => setModal({ open: false })}
        />
      )}
    </div>
  );
}
