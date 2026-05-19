import { auth } from "@/auth";
import { db } from "@/lib/db";
import { User, Mail, Phone, Truck, CheckCircle2 } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DriverProfilePage() {
  const session = await auth();
  if (!session?.user) return null;

  const [user, stats] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, phone: true, createdAt: true },
    }),
    db.booking.aggregate({
      where: { assignedDriverId: session.user.id },
      _count: true,
    }),
  ]);

  const deliveredCount = await db.booking.count({
    where: { assignedDriverId: session.user.id, status: { not: "CONFIRMED" } },
  });

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-black text-[#0f172a]">My Profile</h1>

      {/* Avatar + info */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 text-center">
        <div className="w-20 h-20 bg-[#1e3a8a] rounded-full flex items-center justify-center text-white text-3xl font-black mx-auto mb-4">
          {user?.name?.[0]?.toUpperCase() || "D"}
        </div>
        <div className="font-black text-xl text-[#0f172a] mb-0.5">{user?.name}</div>
        <div className="text-sm text-[#64748b] flex items-center justify-center gap-1">
          <Truck size={13} /> DADA MOVING Driver
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4 text-center">
          <div className="text-3xl font-black text-[#1e3a8a]">{stats._count}</div>
          <div className="text-xs text-[#64748b] mt-0.5">Total Assigned</div>
        </div>
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4 text-center">
          <div className="text-3xl font-black text-green-600">{deliveredCount}</div>
          <div className="text-xs text-[#64748b] mt-0.5">Delivered</div>
        </div>
      </div>

      {/* Contact info */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 space-y-3">
        <h3 className="font-bold text-[#0f172a]">Contact Information</h3>
        <div className="flex items-center gap-3 text-sm">
          <Mail size={15} className="text-[#1e3a8a]" />
          <span className="text-[#0f172a]">{user?.email}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Phone size={15} className="text-[#1e3a8a]" />
          <span className="text-[#0f172a]">{user?.phone || "Not provided"}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <User size={15} className="text-[#1e3a8a]" />
          <span className="text-[#64748b]">Member since {user?.createdAt ? formatDateTime(user.createdAt) : "—"}</span>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-[#1e3a8a]">
        <CheckCircle2 size={14} className="inline mr-1.5 text-blue-500" />
        To update your contact information, please contact the DADA MOVING admin.
      </div>
    </div>
  );
}
