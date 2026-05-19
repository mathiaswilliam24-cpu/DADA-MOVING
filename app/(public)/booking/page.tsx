"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import BookingForm from "@/components/booking/booking-form";
import type { BookingInput } from "@/lib/validations";
import { Truck, CreditCard, CheckCircle2, ArrowLeft } from "lucide-react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface Van { id: string; name: string; cargoCapacity: string; isAvailable: boolean; imageUrl?: string | null; }
interface StateTax { state: string; name: string; taxRate: number; }

function StripePaymentForm({
  clientSecret,
  onSuccess,
  onBack,
}: {
  clientSecret: string;
  onSuccess: () => void;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) { setError(submitError.message || "Payment failed"); setLoading(false); return; }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/dashboard?booking=confirmed` },
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message || "Payment failed");
      setLoading(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handlePay} className="space-y-6">
      <div className="flex items-center gap-2 text-white font-bold text-lg">
        <CreditCard size={20} className="text-[#2563eb]" />
        Secure Payment
      </div>
      <div className="rounded-xl border border-[#374151] bg-[#1f2937] p-4">
        <PaymentElement />
      </div>
      {error && <p className="text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-lg px-4 py-3">{error}</p>}
      <button
        type="submit"
        disabled={loading || !stripe}
        className="w-full py-4 px-6 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-base transition-all disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {loading ? "Processing payment..." : "Confirm & Pay"}
      </button>
      <p className="text-xs text-center text-[#6b7280]">
        Your payment is secured by Stripe. Test card: 4242 4242 4242 4242
      </p>
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-[#6b7280] hover:text-white transition-colors mx-auto"
      >
        <ArrowLeft size={14} />
        Back to booking form
      </button>
    </form>
  );
}

function BookingPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const defaultVanId = searchParams.get("van") || "";

  const [vans, setVans] = useState<Van[]>([]);
  const [states, setStates] = useState<StateTax[]>([]);
  const [settings, setSettings] = useState({ hourlyRate: "17.99", insuranceFee: "4" });
  const [step, setStep] = useState<"form" | "payment" | "success">("form");
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userInfo, setUserInfo] = useState({ firstName: "", lastName: "", phone: "", email: "" });

  useEffect(() => {
    Promise.all([
      fetch("/api/vans?available=true").then(r => r.json()),
      fetch("/api/taxes").then(r => r.json()),
      fetch("/api/profile").then(r => r.ok ? r.json() : null),
    ]).then(([vansData, taxesData, profileData]) => {
      setVans(vansData);
      setStates(taxesData);
      if (profileData) {
        const nameParts = (profileData.name || "").split(" ");
        setUserInfo({
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
          phone: profileData.phone || "",
          email: profileData.email || "",
        });
      }
    });
  }, []);

  const handleBookingSubmit = async (data: BookingInput & { hours: number }) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.status === 401) {
        router.push("/auth/login?callbackUrl=/booking");
        return;
      }
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to create booking");
        return;
      }

      const booking = await res.json();
      setBookingId(booking.id);

      // Create payment intent
      const piRes = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking.id }),
      });

      if (!piRes.ok) {
        alert("Failed to initialize payment. Please try again.");
        return;
      }

      const { clientSecret: cs } = await piRes.json();
      setClientSecret(cs);
      setStep("payment");
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === "success") {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h2>
        <p className="text-[#6b7280] mb-6">Check your email for confirmation details and receipt.</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="px-6 py-3 bg-[#2563eb] text-white font-semibold rounded-xl hover:bg-[#1d4ed8] transition-colors"
        >
          View My Bookings
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      {/* Sidebar */}
      <div className="lg:col-span-2 space-y-5 order-2 lg:order-1">
        <div className="rounded-2xl bg-[#111827] border border-[#1f2937] p-5">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Truck size={18} className="text-[#2563eb]" />
            Why DADA MOVING?
          </h3>
          <ul className="space-y-2.5">
            {[
              "Only $17.99/hour — all sizes",
              "Zero mileage fees",
              "Fixed $4 insurance",
              "Transparent pricing",
              "Secure Stripe payment",
              "Fast, clean pickup",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-[#9ca3af]">
                <CheckCircle2 size={14} className="text-green-400 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-[#1e3a5f]/30 border border-[#2563eb]/20 p-5 text-center">
          <div className="text-3xl font-black text-white">$17<span className="text-lg font-medium text-[#93c5fd]">/hr</span></div>
          <div className="text-[#6b7280] text-xs mt-1">No mileage fees · $4 insurance</div>
        </div>
      </div>

      {/* Main form */}
      <div className="lg:col-span-3 order-1 lg:order-2">
        {step === "form" && (
          <BookingForm
            vans={vans}
            states={states}
            settings={settings}
            defaultVanId={defaultVanId}
            defaultFirstName={userInfo.firstName}
            defaultLastName={userInfo.lastName}
            defaultPhone={userInfo.phone}
            defaultEmail={userInfo.email}
            onSubmit={handleBookingSubmit}
            isSubmitting={isSubmitting}
          />
        )}

        {step === "payment" && clientSecret && (
          <Elements
            stripe={stripePromise}
            options={{ clientSecret, appearance: { theme: "night" } }}
          >
            <StripePaymentForm
              clientSecret={clientSecret}
              onSuccess={() => setStep("success")}
              onBack={() => setStep("form")}
            />
          </Elements>
        )}
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="bg-[#111827] border-b border-[#1f2937] py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold text-white mb-1">Book a Van</h1>
          <p className="text-[#6b7280]">Reserve your van in under 3 minutes. No mileage fees.</p>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Suspense fallback={<div className="text-[#6b7280]">Loading...</div>}>
          <BookingPageContent />
        </Suspense>
      </div>
    </div>
  );
}
