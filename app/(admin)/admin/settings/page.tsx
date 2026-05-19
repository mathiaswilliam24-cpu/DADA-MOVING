"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, Settings, Image } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsMap {
  hourlyRate: string;
  insuranceFee: string;
  minHours: string;
  lateReturnFee: string;
  cleaningFee: string;
  fuelPolicy: string;
  heroImage: string;
  pricingImage: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsMap>({
    hourlyRate: "17.99",
    insuranceFee: "4",
    minHours: "2",
    lateReturnFee: "25",
    cleaningFee: "75",
    fuelPolicy: "",
    heroImage: "",
    pricingImage: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(r => r.json())
      .then((data) => {
        setSettings(prev => ({ ...prev, ...data }));
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    if (res.ok) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setSaving(false);
  };

  const inputCls = "w-full px-4 py-3 rounded-xl bg-[#1f2937] border border-[#374151] text-white placeholder-[#4b5563] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-colors text-sm";

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={24} className="animate-spin text-[#6b7280]" />
    </div>
  );

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings size={22} className="text-[#2563eb]" />
          Settings
        </h1>
        <p className="text-[#6b7280] text-sm mt-0.5">Configure pricing and policies for DADA MOVING.</p>
      </div>

      {success && (
        <div className="mb-4 px-4 py-3 bg-green-900/20 border border-green-800/50 rounded-xl text-sm text-green-400">
          Settings saved successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Pricing */}
        <div className="rounded-2xl bg-[#111827] border border-[#1f2937] p-6">
          <h2 className="text-white font-bold mb-4">Pricing</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Hourly Rate ($)", key: "hourlyRate", placeholder: "17" },
              { label: "Insurance Fee ($)", key: "insuranceFee", placeholder: "4" },
              { label: "Minimum Rental (hours)", key: "minHours", placeholder: "2" },
              { label: "Late Return Fee ($/hour)", key: "lateReturnFee", placeholder: "25" },
              { label: "Cleaning Fee ($)", key: "cleaningFee", placeholder: "75" },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-xs font-medium text-[#d1d5db] mb-1.5">{field.label}</label>
                <input
                  type="text"
                  placeholder={field.placeholder}
                  value={(settings as unknown as Record<string, string>)[field.key]}
                  onChange={(e) => setSettings(p => ({ ...p, [field.key]: e.target.value }))}
                  className={inputCls}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Fuel policy */}
        <div className="rounded-2xl bg-[#111827] border border-[#1f2937] p-6">
          <h2 className="text-white font-bold mb-4">Fuel Policy</h2>
          <textarea
            rows={3}
            value={settings.fuelPolicy}
            onChange={(e) => setSettings(p => ({ ...p, fuelPolicy: e.target.value }))}
            className={cn(inputCls, "resize-none")}
            placeholder="Describe the fuel policy..."
          />
        </div>

        {/* Site Images */}
        <div className="rounded-2xl bg-[#111827] border border-[#1f2937] p-6">
          <h2 className="text-white font-bold mb-2 flex items-center gap-2">
            <Image size={18} className="text-[#f59e0b]" />
            Site Images
          </h2>
          <p className="text-[#6b7280] text-xs mb-4">Upload images to ImgBB and paste the Direct Link here.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#d1d5db] mb-1.5">Hero Image (Homepage Banner)</label>
              <input
                type="url"
                placeholder="https://i.ibb.co/..."
                value={settings.heroImage}
                onChange={(e) => setSettings(p => ({ ...p, heroImage: e.target.value }))}
                className={inputCls}
              />
              {settings.heroImage && (
                <div className="mt-2 rounded-xl overflow-hidden h-28 border border-[#374151]">
                  <img src={settings.heroImage} alt="Hero preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-[#d1d5db] mb-1.5">Pricing Banner Image</label>
              <input
                type="url"
                placeholder="https://i.ibb.co/..."
                value={settings.pricingImage}
                onChange={(e) => setSettings(p => ({ ...p, pricingImage: e.target.value }))}
                className={inputCls}
              />
              {settings.pricingImage && (
                <div className="mt-2 rounded-xl overflow-hidden h-28 border border-[#374151]">
                  <img src={settings.pricingImage} alt="Pricing preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pricing preview */}
        <div className="rounded-2xl bg-[#1e3a5f]/30 border border-[#2563eb]/20 p-5">
          <h3 className="text-white font-semibold text-sm mb-3">Current Pricing Preview</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: "Per Hour", value: `$${settings.hourlyRate}` },
              { label: "Insurance", value: `$${settings.insuranceFee}` },
              { label: "Min. Hours", value: `${settings.minHours}h` },
            ].map((item) => (
              <div key={item.label} className="bg-[#111827] rounded-xl p-3">
                <div className="text-xl font-bold text-white">{item.value}</div>
                <div className="text-xs text-[#6b7280] mt-0.5">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold rounded-xl transition-all disabled:opacity-60"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
