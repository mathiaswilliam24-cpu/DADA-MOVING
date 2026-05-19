"use client";

import { useState, useRef } from "react";
import { Camera, CheckCircle2, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotoSlot {
  key: string;
  label: string;
  required: boolean;
  icon: string;
}

const PHOTO_SLOTS: PhotoSlot[] = [
  { key: "photoFront",     label: "Façade Avant",      required: true,  icon: "🚐" },
  { key: "photoRear",      label: "Façade Arrière",     required: true,  icon: "🔙" },
  { key: "photoRight",     label: "Côté Droit",         required: true,  icon: "➡️" },
  { key: "photoLeft",      label: "Côté Gauche",        required: true,  icon: "⬅️" },
  { key: "photoInterior",  label: "Intérieur Cargo",    required: true,  icon: "📦" },
  { key: "photoDashboard", label: "Tableau de Bord",    required: true,  icon: "🎛️" },
  { key: "photoFuelGauge", label: "Niveau Carburant",   required: true,  icon: "⛽" },
  { key: "photoDamages",   label: "Dommages/Anomalies", required: false, icon: "⚠️" },
];

interface Props {
  onChange: (photos: Record<string, string>) => void;
}

export default function PhotoUploadGrid({ onChange }: Props) {
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleFile = async (key: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      const updated = { ...photos, [key]: url };
      setPhotos(updated);
      onChange(updated);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (key: string) => {
    const updated = { ...photos };
    delete updated[key];
    setPhotos(updated);
    onChange(updated);
  };

  const requiredDone = PHOTO_SLOTS.filter(s => s.required).every(s => photos[s.key]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-[#0f172a]">Photos du Véhicule</h3>
        <span className={cn("text-xs font-bold px-3 py-1 rounded-full", requiredDone ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700")}>
          {Object.keys(photos).filter(k => PHOTO_SLOTS.find(s => s.key === k)).length}/{PHOTO_SLOTS.filter(s => s.required).length} obligatoires
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {PHOTO_SLOTS.map((slot) => (
          <div key={slot.key} className="relative">
            {photos[slot.key] ? (
              <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-green-400">
                <img src={photos[slot.key]} alt={slot.label} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(slot.key)}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                >
                  <X size={12} className="text-white" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs py-1 text-center">
                  <CheckCircle2 size={10} className="inline mr-1 text-green-400" />
                  {slot.label}
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => inputRefs.current[slot.key]?.click()}
                className={cn(
                  "w-full aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-colors",
                  slot.required
                    ? "border-orange-300 bg-orange-50 hover:bg-orange-100"
                    : "border-[#e2e8f0] bg-[#f8fafc] hover:bg-[#f1f5f9]"
                )}
              >
                <span className="text-2xl">{slot.icon}</span>
                <span className="text-xs font-semibold text-[#475569] text-center px-1">{slot.label}</span>
                {slot.required && <span className="text-xs text-orange-500 font-bold">Obligatoire</span>}
                <Camera size={14} className="text-[#94a3b8]" />
              </button>
            )}
            <input
              ref={(el) => { inputRefs.current[slot.key] = el; }}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(slot.key, file);
              }}
            />
          </div>
        ))}
      </div>

      {!requiredDone && (
        <p className="text-xs text-orange-600 mt-3 font-medium">
          ⚠️ Toutes les 7 photos obligatoires doivent être prises avant de continuer.
        </p>
      )}
    </div>
  );
}
