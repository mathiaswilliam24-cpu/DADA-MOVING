import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId } = await req.json();
    if (!bookingId) {
      return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
    }

    const booking = await db.booking.findFirst({
      where: { id: bookingId, userId: session.user.id },
      include: { van: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    if (booking.paymentStatus === "PAID") {
      return NextResponse.json({ error: "Booking already paid" }, { status: 400 });
    }

    const paymentIntent = await getStripe().paymentIntents.create({
      amount: Math.round(booking.totalAmount * 100),
      currency: "usd",
      metadata: {
        bookingId: booking.id,
        bookingNumber: booking.bookingNumber,
        userId: session.user.id,
        vanName: booking.van.name,
      },
      description: `DADA MOVING — ${booking.bookingNumber} — ${booking.van.name}`,
    });

    await db.booking.update({
      where: { id: booking.id },
      data: { stripePaymentId: paymentIntent.id },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Payment intent error:", err);
    return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 });
  }
}
