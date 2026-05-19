"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface Props {
  callbackUrl?: string;
  label?: string;
}

export default function GoogleSignInButton({ callbackUrl = "/dashboard", label = "Continue with Google" }: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    await signIn("google", { callbackUrl });
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      type="button"
      className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 border-2 border-[#e2e8f0] hover:border-[#cbd5e1] rounded-xl text-sm font-semibold text-[#374151] transition-all disabled:opacity-60 shadow-sm"
    >
      {loading ? (
        <Loader2 size={18} className="animate-spin text-[#64748b]" />
      ) : (
        <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
          <path d="M44.5 20H24v8.5h11.8C34.7 33.9 29.9 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.5 20-21 0-1.3-.2-2.7-.5-4z" fill="#FFC107"/>
          <path d="M6.3 14.7l7 5.1C15.1 16.1 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3c-7.7 0-14.4 4.4-17.7 11.7z" fill="#FF3D00"/>
          <path d="M24 45c5.8 0 10.8-1.9 14.7-5.2l-6.8-5.7C29.9 35.9 27.1 37 24 37c-5.8 0-10.7-3.9-12.4-9.3l-7 5.4C7.8 40.7 15.3 45 24 45z" fill="#4CAF50"/>
          <path d="M44.5 20H24v8.5h11.8c-.9 3-3 5.4-5.8 7l6.8 5.7C41 37.3 44.5 31.2 44.5 24c0-1.3-.2-2.7-.5-4z" fill="#1976D2"/>
        </svg>
      )}
      {loading ? "Redirecting..." : label}
    </button>
  );
}
