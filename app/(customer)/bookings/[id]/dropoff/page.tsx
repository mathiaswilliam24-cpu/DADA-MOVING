"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Video, MapPin, AlertCircle, ArrowLeft, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const FUEL_LEVELS = [
  { value: "FULL",          label: "Plein" },
  { value: "THREE_QUARTER", label: "3/4" },
  { value: "HALF",          label: "1/2" },
  { value: "QUARTER",       label: "1/4" },
  { value: "EMPTY",         label: "Vide" },
];

interface BookingData {
  id: string;
  bookingNumber: string;
  deliveryAddress: string;
  van: { name: string };
  checkIn?: { mileageStart: number } | null;
  dropOff?: { id: string } | null;
}

export default function DropOffPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [bookingId, setBookingId] = useState("");
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [mileageEnd, setMileageEnd] = useState("");
  const [fuelLevelEnd, setFuelLevelEnd] = useState("");
  const [gps, setGps] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    params.then(({ id }) => {
      setBookingId(id);
      fetch(`/api/bookings/${id}`).then(r => r.json()).then(data => {
        setBooking(data);
        setLoading(false);
      });
    });
  }, [params]);

  const captureGPS = () => {
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setGps({ lat, lng, address: `${lat.toFixed(6)}, ${lng.toFixed(6)}` });
        setGpsLoading(false);
      },
      () => {
        setGpsLoading(false);
        setError("Impossible d'obtenir la position GPS. Veuillez autoriser la géolocalisation.");
      }
    );
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start();
      setRecording(true);
    } catch {
      setError("Impossible d'accéder à la caméra. Veuillez autoriser l'accès.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const addPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhotos(p => [...p, ev.target?.result as string]);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!mileageEnd || !fuelLevelEnd) {
      setError("Kilométrage et niveau de carburant sont obligatoires.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/dropoff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoUrl,
          photos,
          mileageEnd,
          fuelLevelEnd,
          gpsLatitude: gps?.lat,
          gpsLongitude: gps?.lng,
          gpsAddress: gps?.address,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Une erreur est survenue");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Erreur de connexion.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-[#1e3a8a]" /></div>;

  if (!booking) return (
    <div className="text-center py-20">
      <p className="text-[#64748b]">Réservation introuvable.</p>
      <Link href="/dashboard" className="text-[#1e3a8a] font-semibold mt-4 inline-block">Retour</Link>
    </div>
  );

  if (!booking.checkIn) return (
    <div className="max-w-lg mx-auto text-center py-16">
      <AlertCircle size={40} className="text-orange-500 mx-auto mb-4" />
      <h2 className="text-xl font-black text-[#0f172a] mb-2">Check-In non complété</h2>
      <p className="text-[#64748b] mb-6">Vous devez d'abord compléter le Check-In avant de faire le Drop-Off.</p>
      <Link href={`/bookings/${bookingId}/checkin`} className="px-6 py-3 bg-[#1e3a8a] text-white font-bold rounded-xl">
        Aller au Check-In
      </Link>
    </div>
  );

  if (booking.dropOff || success) return (
    <div className="max-w-lg mx-auto text-center py-16">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 size={40} className="text-green-600" />
      </div>
      <h1 className="text-2xl font-black text-[#0f172a] mb-2">Drop-Off Complété !</h1>
      <p className="text-[#64748b] mb-2">Votre procédure de retour a été enregistrée avec succès.</p>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800 text-left">
        <strong>⚠️ Important :</strong> Veuillez garder les clés disponibles pour le chauffeur DADA MOVING qui viendra récupérer le véhicule. Vous restez entièrement responsable du véhicule jusqu'à l'arrivée physique de notre chauffeur.
      </div>
      <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-[#1e3a8a] text-white font-bold rounded-xl">
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
        <h1 className="text-xl font-black mb-1">Procédure Drop-Off</h1>
        <p className="text-blue-200 text-sm">{booking.bookingNumber} · {booking.van.name}</p>
        <p className="text-blue-300 text-xs mt-1">📍 {booking.deliveryAddress}</p>
      </div>

      <div className="space-y-5">
        {/* Video */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
          <h3 className="font-bold text-[#0f172a] mb-4 flex items-center gap-2">
            <Video size={18} className="text-[#1e3a8a]" />
            Vidéo du Véhicule
          </h3>
          {videoUrl ? (
            <div>
              <video src={videoUrl} controls className="w-full rounded-xl mb-3" />
              <button type="button" onClick={() => setVideoUrl(null)} className="text-sm text-red-500 hover:text-red-700">
                Refaire la vidéo
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <video ref={videoRef} autoPlay muted className={cn("w-full rounded-xl bg-black", !recording && "hidden")} />
              <div className="flex gap-3">
                {!recording ? (
                  <button type="button" onClick={startRecording} className="flex-1 py-3 bg-[#1e3a8a] text-white font-bold rounded-xl flex items-center justify-center gap-2">
                    <Video size={18} /> Démarrer l'enregistrement
                  </button>
                ) : (
                  <button type="button" onClick={stopRecording} className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 animate-pulse">
                    ⏹ Arrêter l'enregistrement
                  </button>
                )}
              </div>
              <p className="text-xs text-[#94a3b8]">Filmez : avant, arrière, côtés, intérieur et tableau de bord</p>
            </div>
          )}
        </div>

        {/* Photos */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
          <h3 className="font-bold text-[#0f172a] mb-4 flex items-center gap-2">
            <Camera size={18} className="text-[#1e3a8a]" />
            Photos supplémentaires ({photos.length})
          </h3>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {photos.map((p, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden border border-[#e2e8f0]">
                <img src={p} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          <label className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-[#e2e8f0] rounded-xl cursor-pointer hover:bg-[#f8fafc] text-sm text-[#64748b]">
            <Camera size={16} /> Ajouter une photo
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={addPhoto} />
          </label>
        </div>

        {/* Mileage + Fuel */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 space-y-4">
          <h3 className="font-bold text-[#0f172a]">Informations de Retour</h3>

          <div>
            <label className="block text-sm font-semibold text-[#374151] mb-1.5">
              Kilométrage final * {booking.checkIn && <span className="text-[#94a3b8] font-normal">(départ: {booking.checkIn.mileageStart} miles)</span>}
            </label>
            <input
              type="number"
              placeholder="Ex: 45890"
              value={mileageEnd}
              onChange={(e) => setMileageEnd(e.target.value)}
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
                  onClick={() => setFuelLevelEnd(f.value)}
                  className={cn(
                    "py-2.5 rounded-xl text-xs font-bold border-2 transition-colors",
                    fuelLevelEnd === f.value ? "border-[#1e3a8a] bg-[#1e3a8a] text-white" : "border-[#e2e8f0] text-[#475569]"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* GPS */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
          <h3 className="font-bold text-[#0f172a] mb-3 flex items-center gap-2">
            <MapPin size={18} className="text-[#1e3a8a]" />
            Position GPS
          </h3>
          {gps ? (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl p-3">
              <CheckCircle2 size={16} />
              Position enregistrée : {gps.lat.toFixed(4)}, {gps.lng.toFixed(4)}
            </div>
          ) : (
            <button
              type="button"
              onClick={captureGPS}
              disabled={gpsLoading}
              className="w-full py-3 border-2 border-[#1e3a8a] text-[#1e3a8a] font-bold rounded-xl hover:bg-blue-50 flex items-center justify-center gap-2"
            >
              {gpsLoading ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
              {gpsLoading ? "Localisation..." : "Enregistrer ma position GPS"}
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || !mileageEnd || !fuelLevelEnd}
          className="w-full py-4 bg-[#f59e0b] hover:bg-[#d97706] text-white font-black rounded-2xl text-lg disabled:opacity-40 flex items-center justify-center gap-2 transition-colors shadow-lg shadow-amber-200"
        >
          {submitting ? <><Loader2 size={20} className="animate-spin" /> Finalisation...</> : "✓ Drop-Off Terminé"}
        </button>
      </div>
    </div>
  );
}
