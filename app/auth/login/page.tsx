"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { Truck, Mail, Lock, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import NextAuthProvider from "@/components/layout/session-provider";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setError(null);
    const result = await signIn("credentials", { email: data.email, password: data.password, redirect: false });
    if (result?.error) {
      setError("Invalid email or password. Please try again.");
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  };

  const inputCls = "w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent transition-colors text-sm bg-white";

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1e3a8a] flex-col justify-between p-12">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-[#f59e0b] rounded-xl flex items-center justify-center">
            <Truck size={20} className="text-white" />
          </div>
          <div>
            <div className="font-black text-white text-lg">DADA MOVING</div>
            <div className="text-blue-300 text-xs">Van Rental Houston</div>
          </div>
        </Link>
        <div>
          <h2 className="text-4xl font-black text-white mb-4">Move more,<br />pay less.</h2>
          <p className="text-blue-200 mb-8">Only $17/hour. No mileage fees. Transparent pricing.</p>
          <ul className="space-y-3">
            {["No mileage fees — ever", "Fixed $4 insurance", "Book in 3 minutes", "Fast pickup"].map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-blue-100 text-sm">
                <CheckCircle2 size={16} className="text-[#f59e0b] flex-shrink-0" /> {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-blue-400 text-sm">© {new Date().getFullYear()} DADA MOVING. Houston, TX.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 bg-[#1e3a8a] rounded-xl flex items-center justify-center">
                <Truck size={20} className="text-white" />
              </div>
              <span className="font-black text-[#1e3a8a] text-xl">DADA MOVING</span>
            </Link>
          </div>

          <h1 className="text-2xl font-black text-[#0f172a] mb-1">Welcome back!</h1>
          <p className="text-[#64748b] text-sm mb-8">Sign in to manage your rentals.</p>

          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#374151] mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
                <input type="email" placeholder="you@example.com" {...register("email")} className={cn(inputCls, "pl-9", errors.email && "border-red-400 focus:ring-red-400")} />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#374151] mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
                <input type={showPw ? "text" : "password"} placeholder="Your password" {...register("password")} className={cn(inputCls, "pl-9 pr-10", errors.password && "border-red-400")} />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#64748b]">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full py-3.5 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-amber-200 mt-2">
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {isSubmitting ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <p className="text-center text-sm text-[#64748b] mt-6">
            Don't have an account?{" "}
            <Link href="/auth/register" className="text-[#1e3a8a] font-semibold hover:underline">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <NextAuthProvider>
      <Suspense fallback={<div className="min-h-screen bg-[#f8fafc]" />}>
        <LoginForm />
      </Suspense>
    </NextAuthProvider>
  );
}
