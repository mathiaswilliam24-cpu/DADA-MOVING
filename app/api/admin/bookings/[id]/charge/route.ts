import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { resend, FROM_EMAIL } from "@/lib/resend";
import { sendSMS } from "@/lib/twilio";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { reason, description, amount, documents } = body;

    if (!reason || !description || !amount || amount <= 0) {
      return NextResponse.json({ error: "reason, description and amount are required" }, { status: 400 });
    }

    const booking = await db.booking.findUnique({
      where: { id },
      include: { user: true, van: true },
    });

    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    if (!booking.stripePaymentMethodId && !booking.user.stripeCustomerId) {
      return NextResponse.json({ error: "No saved payment method for this booking" }, { status: 400 });
    }

    // Get the payment method to charge
    let paymentMethodId = booking.stripePaymentMethodId;
    if (!paymentMethodId) {
      // Fall back to default card
      const defaultCard = await db.savedCard.findFirst({
        where: { userId: booking.userId, isDefault: true },
      });
      if (!defaultCard) return NextResponse.json({ error: "No payment method available" }, { status: 400 });
      paymentMethodId = defaultCard.stripePaymentMethodId;
    }

    const taxRate = booking.taxRate;
    const taxAmount = Math.round(amount * taxRate * 100) / 100;
    const totalAmount = Math.round((amount + taxAmount) * 100) / 100;

    // Charge the card off-session
    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: "usd",
      customer: booking.user.stripeCustomerId || undefined,
      payment_method: paymentMethodId,
      confirm: true,
      off_session: true,
      description: `DADA MOVING — Additional charge — ${booking.bookingNumber} — ${reason}`,
      metadata: {
        bookingId: booking.id,
        bookingNumber: booking.bookingNumber,
        reason,
        type: "additional_charge",
      },
    });

    // Build invoice data
    const invoiceData = JSON.stringify({
      customerName: booking.user.name,
      bookingNumber: booking.bookingNumber,
      vanName: booking.van.name,
      chargeDate: new Date().toISOString(),
      reason,
      description,
      amount,
      taxRate,
      taxAmount,
      totalAmount,
    });

    // Save additional charge record
    const charge = await db.additionalCharge.create({
      data: {
        bookingId: booking.id,
        reason,
        description,
        amount,
        taxRate,
        taxAmount,
        totalAmount,
        stripePaymentId: paymentIntent.id,
        paymentStatus: paymentIntent.status === "succeeded" ? "PAID" : "UNPAID",
        documents: documents || [],
        invoiceData,
      },
    });

    const customerName = booking.user.name || "Customer";
    const chargeTimeStr = formatDateTime(new Date());

    // Send email
    let emailStatus = "failed";
    let emailSentAt: Date | null = null;
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: booking.user.email,
        subject: `Additional Charge Notification – DADA MOVING`,
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8">
<style>
body{font-family:-apple-system,sans-serif;background:#f8fafc;margin:0}
.wrapper{max-width:600px;margin:0 auto;padding:24px}
.card{background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 8px rgba(0,0,0,.08)}
.header{background:#1e3a8a;padding:32px;text-align:center}
.header h1{color:#fff;margin:0;font-size:22px;font-weight:900}
.body{padding:32px}
.alert{background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:16px;margin-bottom:20px;color:#92400e;font-size:14px}
.section{background:#f8fafc;border-radius:12px;padding:20px;margin-bottom:16px}
.section-title{font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px;margin-bottom:12px}
.row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #e2e8f0;font-size:14px}
.row:last-child{border-bottom:none}
.row .label{color:#64748b}
.row .value{color:#0f172a;font-weight:600}
.total{background:#1e3a8a;border-radius:12px;padding:16px 20px;display:flex;justify-content:space-between;align-items:center}
.total .label{color:#93c5fd;font-weight:600}
.total .value{color:#fff;font-size:20px;font-weight:900}
.footer{text-align:center;padding:24px;color:#94a3b8;font-size:12px}
</style>
</head>
<body>
<div class="wrapper">
<div class="card">
<div class="header">
<h1>DADA MOVING</h1>
</div>
<div class="body">
<p style="font-size:17px;font-weight:700;color:#0f172a;margin-bottom:6px">Hello ${customerName},</p>
<p style="color:#64748b;font-size:14px;margin-bottom:20px">We hope you had a great experience with DADA MOVING. An additional charge has been applied to your rental agreement for the following reason:</p>

<div class="alert">
<strong>Reason:</strong> ${reason}<br>
<strong>Description:</strong> ${description}
</div>

<div class="section">
<div class="section-title">Charge Details</div>
<div class="row"><span class="label">Booking Number</span><span class="value">${booking.bookingNumber}</span></div>
<div class="row"><span class="label">Vehicle</span><span class="value">${booking.van.name}</span></div>
<div class="row"><span class="label">Date & Time</span><span class="value">${chargeTimeStr}</span></div>
<div class="row"><span class="label">Reason</span><span class="value">${reason}</span></div>
<div class="row"><span class="label">Amount</span><span class="value">${formatCurrency(amount)}</span></div>
${taxAmount > 0 ? `<div class="row"><span class="label">Tax (${(taxRate * 100).toFixed(2)}%)</span><span class="value">${formatCurrency(taxAmount)}</span></div>` : ""}
</div>

<div class="total">
<span class="label">Total Charged</span>
<span class="value">${formatCurrency(totalAmount)}</span>
</div>

<p style="font-size:13px;color:#64748b;margin-top:20px;line-height:1.6">A detailed invoice has been attached to this email for your records. Thank you for your understanding and for choosing DADA MOVING.</p>
</div>
<div class="footer">
The DADA MOVING Team · Houston, TX<br>
<strong style="color:#f59e0b">Move More, Pay Less.</strong>
</div>
</div>
</div>
</body>
</html>`,
      });
      emailStatus = "sent";
      emailSentAt = new Date();
    } catch (e) { console.error("Email error:", e); }

    // Send SMS
    let smsStatus = "failed";
    let smsSentAt: Date | null = null;
    if (booking.user.phone) {
      try {
        await sendSMS(
          booking.user.phone,
          `DADA MOVING: Hello ${customerName}, an additional charge of ${formatCurrency(totalAmount)} has been applied to your rental ${booking.bookingNumber}. Reason: ${reason}. Check your email for the full invoice.`
        );
        smsStatus = "sent";
        smsSentAt = new Date();
      } catch (e) { console.error("SMS error:", e); }
    }

    // Update notification status
    await db.additionalCharge.update({
      where: { id: charge.id },
      data: { emailStatus, emailSentAt, smsStatus, smsSentAt },
    });

    // Log notifications
    await db.notificationLog.createMany({
      data: [
        { bookingId: booking.id, type: "additional_charge_email", status: emailStatus, recipient: booking.user.email },
        ...(booking.user.phone ? [{ bookingId: booking.id, type: "additional_charge_sms", status: smsStatus, recipient: booking.user.phone }] : []),
      ],
    });

    return NextResponse.json({ success: true, charge });
  } catch (err: unknown) {
    console.error("Additional charge error:", err);
    // Handle Stripe off-session payment failure
    const stripeErr = err as { code?: string; message?: string };
    if (stripeErr?.code === "authentication_required") {
      return NextResponse.json({ error: "Card requires authentication. Please contact the customer." }, { status: 402 });
    }
    return NextResponse.json({ error: "Failed to process charge" }, { status: 500 });
  }
}
