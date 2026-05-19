"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Clock, X, CheckCircle2, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const DURATION_OPTIONS = [
  { label: "+30 min", hours: 0.5 },
  { label: "+1 hour", hours: 1 },
  { label: "+2 hours", hours: 2 },
  { label: "+4 hours", hours: 4 },
  { label: "Custom", hours: 0 },
];

interface ExtensionInfo {
  canExtend: boolean;
  reason?: string;
  minutesUntilEnd?: number;
  currentEndDate?: string;
  newEndDate?: string;
  additionalHours?: number;
  additionalCost?: number;
  taxRate?: number;
  taxAmount?: number;
  totalAdditional?: number;
  hourlyRate?: number;
  currentHours?: number;
  newTotalHours?: number;
}

interface Props {
  bookingId: string;
  bookingNumber: string;
  currentEndDate: Date | string;
  vanName: string;
  currentHours: number;
  onClose: () => void;
  onSuccess: () => void;
}

function PaymentStep({
  clientSecret,
  onConfirm,
  onBack,
  paymentIntentId,
  extensionInfo,
  isLoading,
}: {
  clientSecret: string;
  onConfirm: (piId: string) => void;
  onBack: () => void;
  paymentIntentId: string;
  extensionInfo: ExtensionInfo;
  isLoading: boolean;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setPaying(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) { setError(submitError.message || "Payment failed"); setPaying(false); return; }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/dashboard` },
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message || "Payment failed");
      setPaying(false);
    } else {
      onConfirm(paymentIntentId);
    }
  };

  return (
    <form onSubmit={handlePay} className="space-y-5">
      <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 text-sm space-y-2">
        <div className="flex justify-between">
          <span className="text-[#64748b]">Additional Time</span>
          <span className="font-semibold text-[#0f172a]">+{extensionInfo.additionalHours}h</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#64748b]">New Return Time</span>
          <span className="font-semibold text-[#0f172a]">{extensionInfo.newEndDate ? formatDateTime(extensionInfo.newEndDate) : ""}</span>
        </div>
        <div className="h-px bg-[#e2e8f0]" />
        <div className="flex justify-between font-bold text-[#1e3a8a] text-base">
          <span>Total Charge</span>
          <span>{formatCurrency(extensionInfo.totalAdditional || 0)}</span>
        </div>
      </div>

      <div className="border border-[#e2e8f0] rounded-xl p-4">
        <PaymentElement />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="flex-1 py-3 border-2 border-[#e2e8f0] rounded-xl text-sm font-semibold text-[#475569] hover:bg-[#f8fafc]">
          ← Back
        </button>
        <button
          type="submit"
          disabled={paying || isLoading || !stripe}
          className="flex-1 py-3 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold rounded-xl disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {(paying || isLoading) ? <><Loader2 size={15} className="animate-spin" />Processing...</> : `Pay ${formatCurrency(extensionInfo.totalAdditional || 0)}`}
        </button>
      </div>
    </form>
  );
}

export default function ExtendRentalModal({
  bookingId, bookingNumber, currentEndDate, vanName, currentHours, onClose, onSuccess,
}: Props) {
  const [step, setStep] = useState<"select" | "summary" | "payment" | "success">("select");
  const [selectedHours, setSelectedHours] = useState<number>(1);
  const [customHours, setCustomHours] = useState<string>("3");
  const [isCustom, setIsCustom] = useState(false);
  const [extensionInfo, setExtensionInfo] = useState<ExtensionInfo | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const effectiveHours = isCustom ? parseFloat(customHours) || 1 : selectedHours;

  const handleCheckAvailability = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/extend?hours=${effectiveHours}`);
      const data: ExtensionInfo = await res.json();
      if (!data.canExtend) {
        setError(data.reason || "Extension not available");
        setLoading(false);
        return;
      }
      setExtensionInfo(data);
      setStep("summary");
    } catch {
      setError("Failed to check availability. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToPayment = async () => {
    if (!extensionInfo) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/extend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create-intent", additionalHours: effectiveHours }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to initialize payment"); return; }
      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.paymentIntentId);
      setStep("payment");
    } catch {
      setError("Failed to initialize payment.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (piId: string) => {
    setConfirming(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/extend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirm", additionalHours: effectiveHours, paymentIntentId: piId }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error); return; }
      setStep("success");
    } catch {
      setError("Failed to confirm extension.");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0]">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-[#1e3a8a]" />
            <h2 className="font-black text-[#0f172a]">Extend Rental</h2>
          </div>
          <button onClick={onClose} className="text-[#94a3b8] hover:text-[#0f172a] p-1 rounded-lg hover:bg-[#f1f5f9]">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* Booking info */}
          <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 mb-5 text-sm">
            <div className="font-bold text-[#0f172a] mb-1">{bookingNumber} · {vanName}</div>
            <div className="text-[#64748b] flex items-center gap-1.5">
              <Clock size={13} />
              Current return: <strong className="text-[#0f172a]">{formatDateTime(currentEndDate)}</strong>
            </div>
          </div>

          {/* Step: Select Duration */}
          {step === "select" && (
            <div className="space-y-5">
              <h3 className="font-bold text-[#0f172a]">Select Additional Time</h3>

              <div className="grid grid-cols-2 gap-3">
                {DURATION_OPTIONS.map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => {
                      if (opt.hours === 0) {
                        setIsCustom(true);
                        setSelectedHours(0);
                      } else {
                        setIsCustom(false);
                        setSelectedHours(opt.hours);
                      }
                    }}
                    className={cn(
                      "py-3 px-4 rounded-xl border-2 text-sm font-bold transition-all",
                      (opt.hours === 0 ? isCustom : (!isCustom && selectedHours === opt.hours))
                        ? "border-[#1e3a8a] bg-[#1e3a8a] text-white shadow-md"
                        : "border-[#e2e8f0] text-[#475569] hover:border-[#1e3a8a] hover:text-[#1e3a8a]"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {isCustom && (
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1.5">Custom duration (hours)</label>
                  <input
                    type="number"
                    min="0.5"
                    max="24"
                    step="0.5"
                    value={customHours}
                    onChange={(e) => setCustomHours(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] text-sm"
                    placeholder="e.g. 3 (hours)"
                  />
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
                  <AlertCircle size={15} className="flex-shrink-0 mt-0.5" /> {error}
                </div>
              )}

              <button
                onClick={handleCheckAvailability}
                disabled={loading || effectiveHours <= 0}
                className="w-full py-3.5 bg-[#1e3a8a] hover:bg-[#1e2f6b] text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 size={16} className="animate-spin" /> Checking availability...</> : <>Check Availability <ArrowRight size={16} /></>}
              </button>
            </div>
          )}

          {/* Step: Summary */}
          {step === "summary" && extensionInfo && (
            <div className="space-y-5">
              <h3 className="font-bold text-[#0f172a]">Extension Summary</h3>

              <div className="space-y-3">
                {[
                  { label: "Current Duration", value: `${currentHours}h` },
                  { label: "Additional Time", value: `+${extensionInfo.additionalHours}h`, highlight: true },
                  { label: "New Total Duration", value: `${extensionInfo.newTotalHours}h` },
                  { label: "Current Return Time", value: formatDateTime(currentEndDate) },
                  { label: "New Return Time", value: formatDateTime(extensionInfo.newEndDate!), highlight: true },
                ].map((row) => (
                  <div key={row.label} className={cn("flex justify-between text-sm p-3 rounded-lg", row.highlight ? "bg-blue-50 border border-blue-100" : "bg-[#f8fafc]")}>
                    <span className="text-[#64748b]">{row.label}</span>
                    <span className={cn("font-bold", row.highlight ? "text-[#1e3a8a]" : "text-[#0f172a]")}>{row.value}</span>
                  </div>
                ))}
              </div>

              <div className="border border-[#e2e8f0] rounded-xl p-4 space-y-2 text-sm">
                <div className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-2">Additional Charges</div>
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Rental ({extensionInfo.additionalHours}h × ${extensionInfo.hourlyRate})</span>
                  <span className="text-[#0f172a]">{formatCurrency(extensionInfo.additionalCost || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Tax ({((extensionInfo.taxRate || 0) * 100).toFixed(2)}%)</span>
                  <span className="text-[#0f172a]">{formatCurrency(extensionInfo.taxAmount || 0)}</span>
                </div>
                <div className="h-px bg-[#e2e8f0]" />
                <div className="flex justify-between font-black text-base">
                  <span className="text-[#0f172a]">Total Additional</span>
                  <span className="text-[#1e3a8a]">{formatCurrency(extensionInfo.totalAdditional || 0)}</span>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
                  <AlertCircle size={15} /> {error}
                </div>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep("select")} className="flex-1 py-3 border-2 border-[#e2e8f0] rounded-xl text-sm font-semibold text-[#475569]">
                  ← Back
                </button>
                <button
                  onClick={handleProceedToPayment}
                  disabled={loading}
                  className="flex-1 py-3 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold rounded-xl disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? <><Loader2 size={15} className="animate-spin" />Processing...</> : "Proceed to Payment →"}
                </button>
              </div>
            </div>
          )}

          {/* Step: Payment */}
          {step === "payment" && clientSecret && extensionInfo && (
            <Elements
              stripe={stripePromise}
              options={{ clientSecret, appearance: { theme: "stripe" } }}
            >
              <PaymentStep
                clientSecret={clientSecret}
                onConfirm={handleConfirm}
                onBack={() => setStep("summary")}
                paymentIntentId={paymentIntentId}
                extensionInfo={extensionInfo}
                isLoading={confirming}
              />
            </Elements>
          )}

          {/* Step: Success */}
          {step === "success" && extensionInfo && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-black text-[#0f172a] mb-2">Extension Confirmed!</h3>
              <p className="text-[#64748b] text-sm mb-2">Your rental has been successfully extended.</p>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 my-4 text-sm">
                <div className="font-bold text-[#1e3a8a] mb-1">New Return Time</div>
                <div className="text-[#0f172a] text-lg font-black">{formatDateTime(extensionInfo.newEndDate!)}</div>
              </div>
              <p className="text-xs text-[#94a3b8] mb-6">A confirmation email and SMS have been sent.</p>
              <button
                onClick={() => { onSuccess(); onClose(); }}
                className="w-full py-3 bg-[#1e3a8a] hover:bg-[#1e2f6b] text-white font-bold rounded-xl"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
