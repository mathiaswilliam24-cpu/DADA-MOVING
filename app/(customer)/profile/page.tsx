"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileInput } from "@/lib/validations";
import { User, Phone, Mail, Save, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import NextAuthProvider from "@/components/layout/session-provider";

function ProfileForm() {
  const { data: session, update } = useSession();
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: session?.user?.name || "",
    },
  });

  const onSubmit = async (data: ProfileInput) => {
    setSuccess(false);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      await update({ name: data.name });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const inputCls = "w-full px-4 py-3 rounded-xl bg-[#1f2937] border border-[#374151] text-white placeholder-[#4b5563] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-colors text-sm";

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-white mb-6">My Profile</h1>

      <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-6">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-[#1f2937]">
          <div className="w-14 h-14 rounded-full bg-[#1e3a5f] border-2 border-[#2563eb]/30 flex items-center justify-center text-white text-xl font-bold">
            {session?.user?.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <div className="text-white font-semibold">{session?.user?.name}</div>
            <div className="text-[#6b7280] text-sm">{session?.user?.email}</div>
          </div>
        </div>

        {success && (
          <div className="mb-4 px-4 py-3 bg-green-900/20 border border-green-800/50 rounded-xl text-sm text-green-400">
            Profile updated successfully!
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#d1d5db] mb-1.5">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
              <input type="text" {...register("name")} className={cn(inputCls, "pl-9", errors.name && "border-red-500/60")} />
            </div>
            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#d1d5db] mb-1.5">Phone Number (optional)</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
              <input type="tel" placeholder="+1 (713) 555-0000" {...register("phone")} className={cn(inputCls, "pl-9")} />
            </div>
            <p className="text-xs text-[#4b5563] mt-1">Receive SMS booking confirmations</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#d1d5db] mb-1.5">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
              <input
                type="email"
                value={session?.user?.email || ""}
                disabled
                className={cn(inputCls, "pl-9 opacity-50 cursor-not-allowed")}
              />
            </div>
            <p className="text-xs text-[#4b5563] mt-1">Email cannot be changed</p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-60 mt-2"
          >
            {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <NextAuthProvider>
      <ProfileForm />
    </NextAuthProvider>
  );
}
