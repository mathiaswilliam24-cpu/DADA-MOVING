"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/auth";
import PhotoUploadGrid from "@/components/checkin/photo-upload-grid";
import SignaturePad from "@/components/checkin/signature-pad";
import { CheckCircle2, Loader2, Truck, ArrowLeft, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const FUEL_LEVELS = [
  { value: "FULL",          label: "Plein (Full)" },
  { value: "THREE_QUARTER", label: "3/4" },
  { value: "HALF",          label: "1/2" },
  { value: "QUARTER",       label: "1/4" },
  { value: "EMPTY",         label: "Vide (Empty)" },
];

const TERMS = `CONTRAT DE LOCATION – DADA MOVING

En signant ce contrat, le locataire reconnaît et accepte les conditions suivantes :

1. RESPONSABILITÉ : Le locataire est entièrement responsable du véhicule dès la remise des clés jusqu'au retour physique auprès d'un représentant DADA MOVING.

2. UTILISATION : Le véhicule doit être utilisé de manière légale et responsable. Toute utilisation frauduleuse entraînera la résiliation immédiate du contrat.

3. CARBURANT : Le véhicule doit être retourné avec le même niveau de carburant qu'à la remise. Des frais de $30 seront appliqués en cas de non-respect.

4. DOMMAGES : Le locataire est responsable de tout dommage causé au véhicule pendant la période de location. Les dommages existants ont été documentés lors du Check-In.

5. KILOMÉTRAGE : Le kilométrage est illimité. Aucun frais supplémentaire ne sera appliqué pour la distance parcourue.

6. RETARD : En cas de retard, des frais de $25/heure s'appliquent automatiquement.

7. RETOUR : Le locataire doit compléter la procédure de Drop-Off depuis son compte avant que DADA MOVING ne récupère le véhicule.

8. ASSURANCE : Une assurance fixe de $4 est incluse dans votre réservation.

En signant électroniquement, vous confirmez avoir lu, compris et accepté l'ensemble de ces conditions.`;

interface BookingData {
  id: string;
  bookingNumber: string;
  deliveryAddress: string;
  van: { name: string; imageUrl?: string | null };
  checkIn?: { id: string } | null;
}

export default function CheckInPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [bookingId, setBookingId] = useState<string>("");
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [mileageStart, setMileageStart] = useState("");
  const [fuelLevel, setFuelLevel] = useState("");
  const [driverName, setDriverName] = useState("");
  const [signature, setSignature] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    params.then(({ id }) => {
      setBookingId(id);
      fetch(`/api/bookings/${id}`).then(r => r.json()).then(data => {
        setBooking(data);
        setLoading(false);
      });
    });
  }, [params]);

  const requiredPhotos = ["photoFront", "photoRear", "photoRight", "photoLeft", "photoInterior", "photoDashboard", "photoFuelGauge"];
  const photosComplete = requiredPhotos.every(k => photos[k]);
  const step1Complete = photosComplete;
  const step2Complete = mileageStart && fuelLevel && driverName;
  const step3Complete = signature && termsAccepted;

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...photos,
          photoDamages: photos.photoDamages ? [photos.photoDamages] : [],
          mileageStart,
          fuelLevel,
          driverName,
          signatureData: signature,
          termsAccepted: true,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Une erreur est survenue");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={28} className="animate-spin text-[#1e3a8a]" />
    </div>
  );

  if (!booking) return (
    <div className="text-center py-20">
      <p className="text-[#64748b]">Réservation introuvable.</p>
      <Link href="/dashboard" className="text-[#1e3a8a] font-semibold mt-4 inline-block">Retour au dashboard</Link>
    </div>
  );

  if (booking.checkIn || success) return (
    <div className="max-w-lg mx-auto text-center py-16">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 size={40} className="text-green-600" />
      </div>
      <h1 className="text-2xl font-black text-[#0f172a] mb-2">Check-In Complété !</h1>
      <p className="text-[#64748b] mb-2">Votre location est maintenant officiellement active.</p>
      <p className="text-sm text-[#94a3b8] mb-8">Un email et SMS de confirmation vous ont été envoyés.</p>
      <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-[#1e3a8a] text-white font-bold rounded-xl hover:bg-[#1e2f6b]">
        Voir mes réservations
      </Link>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-[#64748b] hover:text-[#0f172a] mb-6">
        <ArrowLeft size={14} /> Retour
      </Link>

      {/* Header */}
      <div className="bg-[#1e3a8a] rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-[#f59e0b] rounded-xl flex items-center justify-center">
            <Truck size={20} className="text-white" />
          </div>
          <div>
            <div className="font-black text-lg">Vérification du Véhicule</div>
            <div className="text-blue-200 text-sm">Check-In Obligatoire</div>
          </div>
        </div>
        <div className="text-sm text-blue-100 mt-2">
          <strong>{booking.bookingNumber}</strong> · {booking.van.name} · {booking.deliveryAddress}
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {[
          { n: 1, label: "Photos" },
          { n: 2, label: "Infos" },
          { n: 3, label: "Signature" },
        ].map((s, i) => (
          <div key={s.n} className="flex items-center gap-2 flex-1">
            <button
              type="button"
              onClick={() => {
                if (s.n === 2 && !step1Complete) return;
                if (s.n === 3 && (!step1Complete || !step2Complete)) return;
                setStep(s.n);
              }}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors",
                step === s.n ? "bg-[#1e3a8a] text-white" :
                (s.n < step || (s.n === 1 && step1Complete) || (s.n === 2 && step2Complete)) ? "bg-green-500 text-white" :
                "bg-[#e2e8f0] text-[#94a3b8]"
              )}
            >
              {(s.n < step) ? "✓" : s.n}
            </button>
            <span className="text-xs font-medium text-[#64748b] hidden sm:block">{s.label}</span>
            {i < 2 && <div className="flex-1 h-px bg-[#e2e8f0]" />}
          </div>
        ))}
      </div>

      {/* Step 1: Photos */}
      {step === 1 && (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
          <PhotoUploadGrid onChange={setPhotos} />
          <button
            type="button"
            disabled={!photosComplete}
            onClick={() => setStep(2)}
            className="w-full mt-6 py-3.5 bg-[#1e3a8a] hover:bg-[#1e2f6b] text-white font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Continuer → Informations véhicule
          </button>
        </div>
      )}

      {/* Step 2: Vehicle Info */}
      {step === 2 && (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 space-y-5">
          <h3 className="font-black text-[#0f172a] text-lg">Informations du Véhicule</h3>

          <div>
            <label className="block text-sm font-semibold text-[#374151] mb-1.5">Kilométrage actuel *</label>
            <input
              type="number"
              placeholder="Ex: 45230"
              value={mileageStart}
              onChange={(e) => setMileageStart(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#374151] mb-1.5">Niveau de carburant *</label>
            <div className="grid grid-cols-5 gap-2">
              {FUEL_LEVELS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFuelLevel(f.value)}
                  className={cn(
                    "py-2.5 rounded-xl text-xs font-bold border-2 transition-colors text-center",
                    fuelLevel === f.value
                      ? "border-[#1e3a8a] bg-[#1e3a8a] text-white"
                      : "border-[#e2e8f0] text-[#475569] hover:border-[#1e3a8a]"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#374151] mb-1.5">Nom du représentant DADA MOVING *</label>
            <input
              type="text"
              placeholder="Nom du chauffeur/représentant"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] text-sm"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 border-2 border-[#e2e8f0] rounded-xl text-sm font-semibold text-[#475569]">
              ← Retour
            </button>
            <button
              type="button"
              disabled={!step2Complete}
              onClick={() => setStep(3)}
              className="flex-1 py-3 bg-[#1e3a8a] text-white font-bold rounded-xl disabled:opacity-40 transition-colors"
            >
              Continuer → Signature
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Signature + Terms */}
      {step === 3 && (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 space-y-5">
          <h3 className="font-black text-[#0f172a] text-lg">Contrat & Signature Électronique</h3>

          {/* Terms */}
          <div>
            <label className="block text-sm font-semibold text-[#374151] mb-2">Conditions Générales de Location</label>
            <div className="h-48 overflow-y-auto bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 text-xs text-[#475569] leading-relaxed whitespace-pre-line">
              {TERMS}
            </div>
          </div>

          {/* Signature */}
          <SignaturePad onChange={setSignature} />

          {/* Accept terms */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-blue-700"
            />
            <span className="text-sm text-[#374151]">
              Je certifie avoir lu et j'accepte les conditions générales de location. Je confirme que les informations fournies sont exactes et je signe électroniquement ce contrat.
            </span>
          </label>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(2)} className="flex-1 py-3 border-2 border-[#e2e8f0] rounded-xl text-sm font-semibold text-[#475569]">
              ← Retour
            </button>
            <button
              type="button"
              disabled={!step3Complete || submitting}
              onClick={handleSubmit}
              className="flex-1 py-3 bg-[#f59e0b] hover:bg-[#d97706] text-white font-black rounded-xl disabled:opacity-40 flex items-center justify-center gap-2 transition-colors"
            >
              {submitting ? <><Loader2 size={16} className="animate-spin" /> Finalisation...</> : "✓ Finaliser le Check-In"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
