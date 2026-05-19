"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Clock, Loader2 } from "lucide-react";

interface Props {
  bookingId: string;
  cardAuthExpiresAt: Date | string;
}

export default function RentalCompletionTimer({ bookingId, cardAuthExpiresAt }: Props) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const expiry = new Date(cardAuthExpiresAt);

    const tick = () => {
      const now = new Date();
      const diff = Math.ceil((expiry.getTime() - now.getTime()) / 1000);
      if (diff <= 0) {
        setSecondsLeft(0);
        if (!completed && !loading) triggerCompletion();
      } else {
        setSecondsLeft(diff);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [cardAuthExpiresAt, completed]);

  const triggerCompletion = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/complete`, { method: "POST" });
      const data = await res.json();
      if (data.success) setCompleted(true);
    } catch {
      // Will retry on next tick
    } finally {
      setLoading(false);
    }
  };

  if (completed) {
    return (
      <div className="flex items-center gap-2.5 p-4 bg-green-50 border border-green-200 rounded-xl text-sm">
        <CheckCircle2 size={18} className="text-green-600 flex-shrink-0" />
        <div>
          <div className="font-bold text-green-800">Rental Officially Completed</div>
          <div className="text-green-700 text-xs">Card authorization released. No further automatic charges will be applied.</div>
        </div>
      </div>
    );
  }

  if (secondsLeft === null) return null;

  if (secondsLeft <= 0) {
    return (
      <div className="flex items-center gap-2.5 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm">
        <Loader2 size={16} className="text-blue-600 animate-spin flex-shrink-0" />
        <div>
          <div className="font-semibold text-blue-800">Finalizing rental...</div>
          <div className="text-blue-600 text-xs">Releasing card authorization and sending completion notification.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm">
      <Clock size={16} className="text-amber-600 flex-shrink-0" />
      <div>
        <div className="font-semibold text-amber-800">Card Authorization Active</div>
        <div className="text-amber-700 text-xs">
          Card authorization will be released in <strong>{secondsLeft}s</strong>.
          Keep your keys available for the DADA MOVING driver.
        </div>
      </div>
    </div>
  );
}
