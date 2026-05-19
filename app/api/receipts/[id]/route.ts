import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const booking = await db.booking.findFirst({
      where: {
        id,
        userId: session.user.id,
        paymentStatus: "PAID",
      },
      include: { van: true, user: true },
    });

    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    return NextResponse.json({
      bookingNumber: booking.bookingNumber,
      customerName: booking.user.name,
      customerEmail: booking.user.email,
      vanName: booking.van.name,
      startDate: booking.startDate,
      endDate: booking.endDate,
      hours: booking.hours,
      pickupLocation: booking.deliveryAddress,
      rentalFee: booking.rentalFee,
      insuranceFee: booking.insuranceFee,
      subtotal: booking.subtotal,
      taxRate: booking.taxRate,
      taxAmount: booking.taxAmount,
      totalAmount: booking.totalAmount,
      stateCode: booking.stateTaxCode,
      paidAt: booking.updatedAt,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch receipt data" }, { status: 500 });
  }
}
