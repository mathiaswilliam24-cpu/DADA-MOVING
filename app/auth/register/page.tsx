"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerSchema, type RegisterInput } from "@/lib/validations";
import { Truck, Mail, Lock, User, Phone, Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import NextAuthProvider from "@/components/layout/session-provider";

function RegisterForm() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setError(null);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.error || "Registration failed");
      return;
    }

    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    router.push("/dashboard");
  };

  const inputCls = "w-full px-4 py-3 rounded-xl bg-[#1f2937] border border-[#374151] text-white placeholder-[#4b5563] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-colors text-sm";

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-[#2563eb] rounded-xl flex items-center justify-center">
              <Truck size={22} className="text-white" />
            </div>
            <span className="font-bold text-white text-xl">DADA <span className="text-[#2563eb]">MOVING</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-[#6b7280] mt-1 text-sm">Start renting vans in minutes</p>
        </div>

        <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-8">
          {error && (
            <div className="mb-5 px-4 py-3 bg-red-900/20 border border-red-800/50 rounded-xl text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#d1d5db] mb-1.5">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
                <input
                  type="text"
                  placeholder="John Smith"
                  {...register("name")}
                  className={cn(inputCls, "pl-9", errors.name && "border-red-500/60")}
                />
              </div>
              {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#d1d5db] mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                  className={cn(inputCls, "pl-9", errors.email && "border-red-500/60")}
                />
              </div>
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#d1d5db] mb-1.5">Phone (optional)</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
                <input
                  type="tel"
                  placeholder="+1 (713) 555-0000"
                  {...register("phone")}
                  className={cn(inputCls, "pl-9")}
                />
              </div>
              <p className="text-xs text-[#4b5563] mt-1">Used for SMS booking confirmations</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#d1d5db] mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  {...register("password")}
                  className={cn(inputCls, "pl-9 pr-10", errors.password && "border-red-500/60")}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-white transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#d1d5db] mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Repeat password"
                  {...register("confirmPassword")}
                  className={cn(inputCls, "pl-9", errors.confirmPassword && "border-red-500/60")}
                />
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-400 mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold rounded-xl transition-all mt-2 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {isSubmitting ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-[#6b7280] mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-[#60a5fa] hover:text-white font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <NextAuthProvider>
      <RegisterForm />
    </NextAuthProvider>
  );
}
