"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { CreditCard, Trash2, Star, Plus, Loader2, CheckCircle2, AlertCircle, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface SavedCard {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

const BRAND_ICONS: Record<string, string> = {
  visa: "💳",
  mastercard: "💳",
  amex: "💳",
  discover: "💳",
};

function AddCardForm({ onAdded, onCancel }: { onAdded: () => void; onCancel: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);

    // Create SetupIntent
    const siRes = await fetch("/api/payment-methods/setup", { method: "POST" });
    const { clientSecret } = await siRes.json();

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    const { error: confirmError, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
      payment_method: { card: cardElement },
    });

    if (confirmError) {
      setError(confirmError.message || "Failed to save card");
      setLoading(false);
      return;
    }

    // Save card to DB
    const saveRes = await fetch("/api/payment-methods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setupIntentId: setupIntent?.id }),
    });

    if (!saveRes.ok) {
      setError("Failed to save card");
      setLoading(false);
      return;
    }

    setLoading(false);
    onAdded();
  };

  return (
    <form onSubmit={handleSave} className="bg-white border-2 border-[#1e3a8a] rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Shield size={16} className="text-[#1e3a8a]" />
        <span className="font-bold text-[#0f172a] text-sm">Add New Card</span>
      </div>

      <div className="border border-[#e2e8f0] rounded-xl p-4 bg-[#f8fafc]">
        <CardElement
          options={{
            style: {
              base: { fontSize: "14px", color: "#0f172a", "::placeholder": { color: "#94a3b8" } },
            },
          }}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-[#1e3a8a]">
        <Shield size={12} className="inline mr-1" />
        Your card information is securely encrypted and processed through Stripe (PCI-DSS compliant).
        This card may be charged for rental extensions, additional fees, or policy violations during your rental.
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onCancel} className="flex-1 py-2.5 border-2 border-[#e2e8f0] rounded-xl text-sm font-semibold text-[#475569]">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-[#1e3a8a] hover:bg-[#1e2f6b] text-white font-bold rounded-xl disabled:opacity-60 flex items-center justify-center gap-2">
          {loading ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : "Save Card"}
        </button>
      </div>
    </form>
  );
}

export default function SavedCards() {
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchCards = async () => {
    const res = await fetch("/api/payment-methods");
    if (res.ok) setCards(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchCards(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this card?")) return;
    setDeleting(id);
    await fetch(`/api/payment-methods/${id}`, { method: "DELETE" });
    await fetchCards();
    setDeleting(null);
  };

  const handleSetDefault = async (id: string) => {
    await fetch(`/api/payment-methods/${id}`, { method: "PATCH" });
    await fetchCards();
  };

  if (loading) return <div className="text-center py-6"><Loader2 size={20} className="animate-spin text-[#1e3a8a] mx-auto" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-[#0f172a]">Payment Methods</h3>
        {!showAdd && (
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 text-sm font-semibold text-[#1e3a8a] hover:underline">
            <Plus size={14} /> Add Card
          </button>
        )}
      </div>

      {/* Policy notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <Shield size={15} className="inline mr-1.5 text-amber-600" />
        <strong>Card Authorization Policy:</strong> Your payment card must remain active during your entire rental period.
        It may be charged for rental extensions, fuel violations, cleaning fees, late returns, damage, or other policy violations.
      </div>

      {cards.length === 0 && !showAdd && (
        <div className="text-center py-8 rounded-xl border border-dashed border-[#e2e8f0]">
          <CreditCard size={32} className="mx-auto text-[#cbd5e1] mb-2" />
          <p className="text-[#64748b] text-sm mb-3">No saved cards yet</p>
          <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-[#1e3a8a] text-white text-sm font-bold rounded-xl hover:bg-[#1e2f6b]">
            Add Your First Card
          </button>
        </div>
      )}

      {cards.map((card) => (
        <div key={card.id} className={cn("flex items-center gap-4 p-4 rounded-2xl border-2 bg-white transition-all",
          card.isDefault ? "border-[#1e3a8a] bg-blue-50" : "border-[#e2e8f0] hover:border-[#cbd5e1]")}>
          <div className="w-12 h-8 bg-[#f1f5f9] rounded-lg flex items-center justify-center text-xl flex-shrink-0">
            {BRAND_ICONS[card.brand] || "💳"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#0f172a] text-sm capitalize">{card.brand}</span>
              <span className="text-[#64748b] text-sm">•••• {card.last4}</span>
              {card.isDefault && (
                <span className="flex items-center gap-1 text-xs text-[#1e3a8a] font-bold bg-blue-100 px-2 py-0.5 rounded-full">
                  <CheckCircle2 size={10} /> Default
                </span>
              )}
            </div>
            <div className="text-xs text-[#94a3b8]">Expires {card.expMonth.toString().padStart(2, "0")}/{card.expYear}</div>
          </div>
          <div className="flex items-center gap-2">
            {!card.isDefault && (
              <button onClick={() => handleSetDefault(card.id)} title="Set as default"
                className="text-xs text-[#64748b] hover:text-[#1e3a8a] flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-blue-50">
                <Star size={13} /> Default
              </button>
            )}
            <button onClick={() => handleDelete(card.id)} disabled={deleting === card.id}
              className="p-1.5 text-[#94a3b8] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
              {deleting === card.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            </button>
          </div>
        </div>
      ))}

      {showAdd && (
        <Elements stripe={stripePromise}>
          <AddCardForm onAdded={() => { setShowAdd(false); fetchCards(); }} onCancel={() => setShowAdd(false)} />
        </Elements>
      )}
    </div>
  );
}
