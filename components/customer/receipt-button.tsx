"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

export default function ReceiptButton({ bookingId }: { bookingId: string }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/receipts/${bookingId}`);
      if (!res.ok) throw new Error("Failed to fetch receipt data");
      const data = await res.json();

      const { generateReceiptPDF } = await import("@/lib/pdf");
      const blob = await generateReceiptPDF(data);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `DADA-MOVING-Receipt-${data.bookingNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to generate receipt. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1e3a5f] hover:bg-[#2d5280] text-white text-sm font-semibold rounded-xl transition-colors border border-[#2563eb]/30 disabled:opacity-60"
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Download size={16} />
      )}
      {loading ? "Generating..." : "Download Receipt PDF"}
    </button>
  );
}
