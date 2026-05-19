"use client";

import { useState } from "react";
import { DollarSign, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

const CHARGE_REASONS = [
  "Fuel Policy Violation",
  "Missing Fuel",
  "Cleaning Fee",
  "Late Return",
  "Vehicle Damage",
  "Traffic Violation / Toll",
  "Missing Equipment",
  "Excessive Dirt / Pet Hair",
  "Policy Violation",
  "Other",
];

interface Props {
  bookingId: string;
  bookingNumber: string;
  customerName: string;
  taxRate: number;
  cardAuthActive: boolean;
  cardAuthExpiresAt?: Date | null;
  onChargeCreated: () => void;
}

export default function AdditionalChargeForm({
  bookingId, bookingNumber, customerName, taxRate, cardAuthActive, cardAuthExpiresAt, onChargeCreated,
}: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amountNum = parseFloat(amount) || 0;
  const taxAmount = Math.round(amountNum * taxRate * 100) / 100;
  const total = Math.round((amountNum + taxAmount) * 100) / 100;

  const isAuthExpired = cardAuthExpiresAt ? new Date() > new Date(cardAuthExpiresAt) : !cardAuthActive;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason || !description || !amountNum) return;
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/admin/bookings/${bookingId}/charge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason, description, amount: amountNum }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to process charge");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    setTimeout(() => {
      setSuccess(false);
      setOpen(false);
      setReason("");
      setDescription("");
      setAmount("");
      onChargeCreated();
    }, 2000);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl border-2 transition-colors",
          cardAuthActive && !isAuthExpired
            ? "border-red-200 text-red-600 bg-red-50 hover:bg-red-100"
            : "border-[#e2e8f0] text-[#94a3b8] cursor-not-allowed"
        )}
        disabled={!cardAuthActive || isAuthExpired}
        title={!cardAuthActive || isAuthExpired ? "Card authorization has expired" : ""}
      >
        <DollarSign size={14} />
        Additional Charge
        {(!cardAuthActive || isAuthExpired) && <span className="text-xs">(inactive)</span>}
      </button>
    );
  }

  return (
    <div className="mt-4 p-5 bg-red-50 border-2 border-red-200 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-[#0f172a] flex items-center gap-2">
          <DollarSign size={16} className="text-red-600" />
          Additional Charge — {bookingNumber}
        </h4>
        <button onClick={() => setOpen(false)} className="text-[#94a3b8] hover:text-[#0f172a] text-xl">×</button>
      </div>

      {success ? (
        <div className="text-center py-4">
          <CheckCircle2 size={32} className="text-green-600 mx-auto mb-2" />
          <p className="font-bold text-green-700">Charge processed successfully!</p>
          <p className="text-sm text-green-600">Email and SMS sent to {customerName}.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#374151] mb-1.5">Charge Reason *</label>
            <select value={reason} onChange={(e) => setReason(e.target.value)} required
              className="w-full px-3 py-2.5 rounded-xl border border-[#e2e8f0] bg-white text-sm text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-red-400">
              <option value="">Select a reason...</option>
              {CHARGE_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#374151] mb-1.5">Description *</label>
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} required
              placeholder="Detailed description of the charge..."
              className="w-full px-3 py-2.5 rounded-xl border border-[#e2e8f0] bg-white text-sm text-[#0f172a] resize-none focus:outline-none focus:ring-2 focus:ring-red-400" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#374151] mb-1.5">Amount ($) *</label>
            <input type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required
              placeholder="0.00"
              className="w-full px-3 py-2.5 rounded-xl border border-[#e2e8f0] bg-white text-sm text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-red-400" />
          </div>

          {amountNum > 0 && (
            <div className="bg-white border border-red-200 rounded-xl p-4 text-sm space-y-2">
              <div className="flex justify-between"><span className="text-[#64748b]">Amount</span><span>{formatCurrency(amountNum)}</span></div>
              {taxAmount > 0 && <div className="flex justify-between"><span className="text-[#64748b]">Tax ({(taxRate * 100).toFixed(2)}%)</span><span>{formatCurrency(taxAmount)}</span></div>}
              <div className="flex justify-between font-black text-base border-t border-red-100 pt-2">
                <span className="text-[#0f172a]">Total Charge</span>
                <span className="text-red-600">{formatCurrency(total)}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 text-sm text-red-700 bg-red-100 border border-red-300 rounded-xl p-3">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" /> {error}
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
            ⚠️ This will immediately charge the customer's saved card for <strong>{formatCurrency(total)}</strong>.
            An invoice, email and SMS will be sent automatically.
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => setOpen(false)} className="flex-1 py-2.5 border-2 border-[#e2e8f0] rounded-xl text-sm font-semibold text-[#475569] bg-white">
              Cancel
            </button>
            <button type="submit" disabled={loading || !reason || !description || !amountNum}
              className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <><Loader2 size={14} className="animate-spin" />Processing...</> : `Charge ${formatCurrency(total)}`}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
