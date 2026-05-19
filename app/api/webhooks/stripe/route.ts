import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { resend, FROM_EMAIL } from "@/lib/resend";
import { sendSMS } from "@/lib/twilio";
import { bookingConfirmationHtml, bookingConfirmationText } from "@/lib/email-templates";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig!, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object as Stripe.PaymentIntent;
    const bookingId = pi.metadata?.bookingId;

    if (!bookingId) return NextResponse.json({ received: true });

    const booking = await db.booking.update({
      where: { id: bookingId },
      data: { paymentStatus: "PAID", status: "CONFIRMED" },
      include: { van: true, user: true },
    });

    // Create receipt record
    await db.receipt.upsert({
      where: { bookingId: booking.id },
      update: {},
      create: { bookingId: booking.id },
    });

    // Send email
    if (booking.user.email) {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: booking.user.email,
        subject: `Booking Confirmed — ${booking.bookingNumber} | DADA MOVING`,
        html: bookingConfirmationHtml({
          customerName: booking.user.name || "Customer",
          bookingNumber: booking.bookingNumber,
          vanName: booking.van.name,
          startDate: booking.startDate,
          endDate: booking.endDate,
          hours: booking.hours,
          pickupLocation: booking.deliveryAddress,
          rentalFee: booking.rentalFee,
          insuranceFee: booking.insuranceFee,
          taxAmount: booking.taxAmount,
          totalAmount: booking.totalAmount,
          stateCode: booking.stateTaxCode,
        }),
        text: bookingConfirmationText({
          customerName: booking.user.name || "Customer",
          bookingNumber: booking.bookingNumber,
          vanName: booking.van.name,
          startDate: booking.startDate,
          endDate: booking.endDate,
          hours: booking.hours,
          pickupLocation: booking.deliveryAddress,
          rentalFee: booking.rentalFee,
          insuranceFee: booking.insuranceFee,
          taxAmount: booking.taxAmount,
          totalAmount: booking.totalAmount,
          stateCode: booking.stateTaxCode,
        }),
      });
    }

    // Send SMS
    if (booking.user.phone) {
      await sendSMS(
        booking.user.phone,
        `DADA MOVING: Your booking ${booking.bookingNumber} is CONFIRMED! Van: ${booking.van.name}. Pick up: ${new Date(booking.startDate).toLocaleDateString("en-US")}. Total: $${booking.totalAmount.toFixed(2)}. No mileage fees!`
      );
    }
  }

  return NextResponse.json({ received: true });
}
