"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookingSchema, type BookingInput } from "@/lib/validations";
import PriceCalculator from "./price-calculator";
import { CalendarDays, Clock, MapPin, Upload, Truck, ChevronDown, User, Phone, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/language-provider";

interface Van {
  id: string;
  name: string;
  cargoCapacity: string;
  isAvailable: boolean;
  imageUrl?: string | null;
}

interface StateTax {
  state: string;
  name: string;
  taxRate: number;
}

interface Settings {
  hourlyRate: string;
  insuranceFee: string;
}

interface Props {
  vans: Van[];
  states: StateTax[];
  settings: Settings;
  defaultVanId?: string;
  defaultFirstName?: string;
  defaultLastName?: string;
  defaultPhone?: string;
  defaultEmail?: string;
  onSubmit: (data: BookingInput & { hours: number }) => Promise<void>;
  isSubmitting: boolean;
}

export default function BookingForm({ vans, states, settings, defaultVanId, defaultFirstName, defaultLastName, defaultPhone, defaultEmail, onSubmit, isSubmitting }: Props) {
  const { t } = useLanguage();
  const b = t.booking;
  const [hours, setHours] = useState(0);
  const [licenseUrl, setLicenseUrl] = useState<string>("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      vanId: defaultVanId || "",
      stateTaxCode: "TX",
      startDate: new Date().toISOString().split("T")[0],
      firstName: defaultFirstName || "",
      lastName: defaultLastName || "",
      phone: defaultPhone || "",
      email: defaultEmail || "",
    },
  });

  const startDate = watch("startDate");
  const startTime = watch("startTime");
  const endDate = watch("endDate");
  const endTime = watch("endTime");
  const selectedState = watch("stateTaxCode");

  useEffect(() => {
    if (startDate && startTime && endDate && endTime) {
      const start = new Date(`${startDate}T${startTime}`);
      const end = new Date(`${endDate}T${endTime}`);
      const diff = (end.getTime() - start.getTime()) / 3600000;
      setHours(Math.max(0, Math.round(diff * 10) / 10));
    }
  }, [startDate, startTime, endDate, endTime]);

  const handleFormSubmit = async (data: BookingInput) => {
    await onSubmit({ ...data, hours, licenseUrl: licenseUrl || undefined });
  };

  const inputCls = cn(
    "w-full px-4 py-3 rounded-xl bg-[#1f2937] border text-white placeholder-[#4b5563]",
    "focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-colors text-sm"
  );
  const errCls = "border-red-500/60";
  const okCls = "border-[#374151]";

  const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-sm font-medium text-[#d1d5db] mb-1.5">{children}</label>
  );
  const Error = ({ msg }: { msg?: string }) =>
    msg ? <p className="text-xs text-red-400 mt-1">{msg}</p> : null;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* Step 1: Select Van */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-[#2563eb] text-white text-xs font-bold flex items-center justify-center">1</span>
          {b.step1}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {vans.filter(v => v.isAvailable).map((van) => {
            const isSelected = watch("vanId") === van.id;
            return (
              <button
                key={van.id}
                type="button"
                onClick={() => setValue("vanId", van.id)}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-xl border text-left transition-all",
                  isSelected
                    ? "border-[#2563eb] bg-[#1e3a5f]/40"
                    : "border-[#374151] bg-[#1f2937] hover:border-[#4b5563]"
                )}
              >
                {van.imageUrl ? (
                  <img src={van.imageUrl} alt={van.name} className="w-16 h-12 object-cover rounded-lg flex-shrink-0" />
                ) : (
                  <div className="w-16 h-12 bg-[#374151] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Truck size={20} className="text-[#6b7280]" />
                  </div>
                )}
                <div>
                  <div className="text-sm font-semibold text-white">{van.name}</div>
                  <div className="text-xs text-[#6b7280]">{van.cargoCapacity} · $17/hr</div>
                </div>
                {isSelected && (
                  <div className="ml-auto w-5 h-5 rounded-full bg-[#2563eb] flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <Error msg={errors.vanId?.message} />
      </div>

      {/* Step 2: Date & Time */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-[#2563eb] text-white text-xs font-bold flex items-center justify-center">2</span>
          {b.step2}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>{b.startDate}</Label>
            <div className="relative">
              <CalendarDays size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
              <input
                type="date"
                {...register("startDate")}
                className={cn(inputCls, "pl-9", errors.startDate ? errCls : okCls)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <Error msg={errors.startDate?.message} />
          </div>
          <div>
            <Label>{b.startTime}</Label>
            <div className="relative">
              <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
              <input
                type="time"
                {...register("startTime")}
                className={cn(inputCls, "pl-9", errors.startTime ? errCls : okCls)}
              />
            </div>
            <Error msg={errors.startTime?.message} />
          </div>
          <div>
            <Label>{b.endDate}</Label>
            <div className="relative">
              <CalendarDays size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
              <input
                type="date"
                {...register("endDate")}
                className={cn(inputCls, "pl-9", errors.endDate ? errCls : okCls)}
                min={startDate || new Date().toISOString().split("T")[0]}
              />
            </div>
            <Error msg={errors.endDate?.message} />
          </div>
          <div>
            <Label>{b.endTime}</Label>
            <div className="relative">
              <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
              <input
                type="time"
                {...register("endTime")}
                className={cn(inputCls, "pl-9", errors.endTime ? errCls : okCls)}
              />
            </div>
            <Error msg={errors.endTime?.message} />
          </div>
        </div>
        {hours > 0 && (
          <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-[#1e3a5f]/60 border border-[#2563eb]/30 rounded-lg text-sm text-[#93c5fd]">
            <Clock size={14} />
            {b.duration}: <strong className="text-white">{hours} hour{hours !== 1 ? "s" : ""}</strong>
            {hours < 2 && <span className="text-orange-400 text-xs ml-1">{b.minimum}</span>}
          </div>
        )}
      </div>

      {/* Step 3: Delivery Address */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-[#2563eb] text-white text-xs font-bold flex items-center justify-center">3</span>
          {b.step3}
        </h2>
        <div className="bg-blue-900/30 border border-blue-700/40 rounded-xl p-3 mb-4 text-sm text-blue-200 flex items-start gap-2">
          <span className="text-blue-400 flex-shrink-0">🚐</span>
          <span>{b.deliveryNote}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label>{b.deliveryLabel}</Label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
              <input
                type="text"
                placeholder={b.deliveryPlaceholder}
                {...register("pickupLocation")}
                className={cn(inputCls, "pl-9", errors.pickupLocation ? errCls : okCls)}
              />
            </div>
            <Error msg={errors.pickupLocation?.message} />
          </div>
          <div>
            <Label>{b.stateLabel}</Label>
            <div className="relative">
              <select
                {...register("stateTaxCode")}
                className={cn(inputCls, "appearance-none pr-8", errors.stateTaxCode ? errCls : okCls)}
              >
                <option value="">Select state...</option>
                {states.map((s) => (
                  <option key={s.state} value={s.state}>
                    {s.name} ({(s.taxRate * 100).toFixed(2)}%)
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] pointer-events-none" />
            </div>
            <Error msg={errors.stateTaxCode?.message} />
          </div>
        </div>
      </div>

      {/* Step 4: Personal Information */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-[#2563eb] text-white text-xs font-bold flex items-center justify-center">4</span>
          {b.step4}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>{b.firstName}</Label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
              <input
                type="text"
                placeholder={b.firstNamePlaceholder}
                {...register("firstName")}
                className={cn(inputCls, "pl-9", errors.firstName ? errCls : okCls)}
              />
            </div>
            <Error msg={errors.firstName?.message} />
          </div>
          <div>
            <Label>{b.lastName}</Label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
              <input
                type="text"
                placeholder={b.lastNamePlaceholder}
                {...register("lastName")}
                className={cn(inputCls, "pl-9", errors.lastName ? errCls : okCls)}
              />
            </div>
            <Error msg={errors.lastName?.message} />
          </div>
          <div>
            <Label>{b.phone}</Label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
              <input
                type="tel"
                placeholder={b.phonePlaceholder}
                {...register("phone")}
                className={cn(inputCls, "pl-9", errors.phone ? errCls : okCls)}
              />
            </div>
            <Error msg={errors.phone?.message} />
          </div>
          <div>
            <Label>{b.email}</Label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
              <input
                type="email"
                placeholder={b.emailPlaceholder}
                {...register("email")}
                className={cn(inputCls, "pl-9", errors.email ? errCls : okCls)}
              />
            </div>
            <Error msg={errors.email?.message} />
          </div>
        </div>
        <p className="text-xs text-[#6b7280] mt-2">{b.notifNote}</p>
      </div>

      {/* Step 5: License Upload */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-[#2563eb] text-white text-xs font-bold flex items-center justify-center">5</span>
          {b.step5}
        </h2>
        <div className="rounded-xl border border-dashed border-[#374151] bg-[#1f2937]/50 p-6 text-center">
          <Upload size={24} className="mx-auto text-[#6b7280] mb-2" />
          <p className="text-sm text-[#9ca3af] mb-1">{b.licenseTitle}</p>
          <p className="text-xs text-[#6b7280] mb-4">{b.licenseFormats}</p>
          {licenseUrl ? (
            <div className="inline-flex items-center gap-2 text-sm text-green-400">
              <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
              {b.licenseUploaded}
            </div>
          ) : (
            <input
              type="file"
              accept="image/*,.pdf"
              className="text-xs text-[#9ca3af] file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#2563eb] file:text-white hover:file:bg-[#1d4ed8] file:cursor-pointer cursor-pointer"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                // In production, this would upload via UploadThing API
                // For now we store a placeholder URL
                setLicenseUrl(`license-${Date.now()}-${file.name}`);
              }}
            />
          )}
        </div>
        <p className="text-xs text-[#6b7280] mt-2">{b.licenseNote}</p>
      </div>

      {/* Price Calculator */}
      <PriceCalculator
        hours={hours}
        stateCode={selectedState || "TX"}
        hourlyRate={parseFloat(settings.hourlyRate)}
        insuranceFee={parseFloat(settings.insuranceFee)}
      />

      {/* Notes */}
      <div>
        <Label>{b.notes}</Label>
        <textarea
          rows={3}
          placeholder={b.notesPH}
          {...register("notes")}
          className={cn(inputCls, "resize-none", okCls)}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting || hours < 2}
        className={cn(
          "w-full py-4 px-6 rounded-xl text-white font-bold text-base transition-all",
          isSubmitting || hours < 2
            ? "bg-[#1f2937] text-[#4b5563] cursor-not-allowed"
            : "bg-[#2563eb] hover:bg-[#1d4ed8] shadow-lg shadow-blue-900/30 active:scale-[0.98]"
        )}
      >
        {isSubmitting ? b.processing : hours < 2 ? b.minRequired : b.continuePayment}
      </button>
    </form>
  );
}
