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
    const chargeType = pi.metadata?.type;

    // Skip extension charges — handled separately
    if (chargeType === "extension") return NextResponse.json({ received: true });

    if (!bookingId) return NextResponse.json({ received: true });

    // Get the payment method used
    const paymentMethodId = typeof pi.payment_method === "string"
      ? pi.payment_method
      : pi.payment_method?.id;

    const booking = await db.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: "PAID",
        status: "CONFIRMED",
        stripePaymentId: pi.id,
        stripePaymentMethodId: paymentMethodId || null,
        cardAuthActive: true,
      },
      include: { van: true, user: true },
    });

    // Save card to SavedCard if payment method available
    if (paymentMethodId && booking.user.stripeCustomerId) {
      try {
        const pm = await getStripe().paymentMethods.retrieve(paymentMethodId) as Stripe.PaymentMethod & { card?: { brand: string; last4: string; exp_month: number; exp_year: number } };
        if (pm.card) {
          const existing = await db.savedCard.findUnique({ where: { stripePaymentMethodId: paymentMethodId } });
          if (!existing) {
            const cardCount = await db.savedCard.count({ where: { userId: booking.userId } });
            await db.savedCard.create({
              data: {
                userId: booking.userId,
                stripeCustomerId: booking.user.stripeCustomerId!,
                stripePaymentMethodId: paymentMethodId,
                brand: pm.card.brand,
                last4: pm.card.last4,
                expMonth: pm.card.exp_month,
                expYear: pm.card.exp_year,
                isDefault: cardCount === 0,
              },
            });
          }
        }
      } catch (e) { console.error("Save card error:", e); }
    }

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
      }).catch(console.error);
    }

    // Send SMS
    if (booking.user.phone) {
      await sendSMS(
        booking.user.phone,
        `DADA MOVING: Your booking ${booking.bookingNumber} is CONFIRMED! Van: ${booking.van.name}. Delivery to: ${booking.deliveryAddress}. Total: $${booking.totalAmount.toFixed(2)}. Your payment card is authorized for the rental period.`
      ).catch(console.error);
    }
  }

  return NextResponse.json({ received: true });
}
