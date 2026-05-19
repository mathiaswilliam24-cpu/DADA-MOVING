import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { calculatePrice } from "@/lib/tax-calculator";
import { resend, FROM_EMAIL } from "@/lib/resend";
import { sendSMS } from "@/lib/twilio";
import { formatDateTime, formatCurrency } from "@/lib/utils";

// GET: Check availability and calculate cost for extension options
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const additionalHours = parseFloat(searchParams.get("hours") || "1");

    const booking = await db.booking.findFirst({
      where: { id, userId: session.user.id, paymentStatus: "PAID" },
      include: { van: true },
    });

    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    // Check if within 30 minutes of end time
    const now = new Date();
    const endTime = new Date(booking.endDate);
    const minutesUntilEnd = (endTime.getTime() - now.getTime()) / 60000;

    if (minutesUntilEnd < 30) {
      return NextResponse.json({
        canExtend: false,
        reason: "Extensions are not available within 30 minutes of your scheduled return time.",
      });
    }

    // Check van availability for extension period
    const newEndDate = new Date(booking.endDate);
    newEndDate.setMinutes(newEndDate.getMinutes() + additionalHours * 60);

    const conflictingBooking = await db.booking.findFirst({
      where: {
        vanId: booking.vanId,
        id: { not: booking.id },
        paymentStatus: "PAID",
        status: { notIn: ["CANCELLED"] },
        OR: [
          { startDate: { gte: booking.endDate, lt: newEndDate } },
          { startDate: { lt: booking.endDate }, endDate: { gt: booking.endDate } },
        ],
      },
    });

    if (conflictingBooking) {
      return NextResponse.json({
        canExtend: false,
        reason: `The van is not available for the requested extension. It has another booking starting soon.`,
      });
    }

    // Check if van is still available
    if (!booking.van.isAvailable) {
      return NextResponse.json({
        canExtend: false,
        reason: "This van is currently marked as unavailable.",
      });
    }

    // Get settings
    const [rateRow, insRow] = await Promise.all([
      db.appSettings.findUnique({ where: { key: "hourlyRate" } }),
      db.appSettings.findUnique({ where: { key: "insuranceFee" } }),
    ]);

    const hourlyRate = rateRow ? parseFloat(rateRow.value) : 17.99;

    // Calculate cost (no insurance fee for extensions — only rental + taxes)
    const additionalRentalCost = Math.round(additionalHours * hourlyRate * 100) / 100;
    const taxRate = booking.taxRate;
    const taxAmount = Math.round(additionalRentalCost * taxRate * 100) / 100;
    const totalAdditional = Math.round((additionalRentalCost + taxAmount) * 100) / 100;

    return NextResponse.json({
      canExtend: true,
      minutesUntilEnd: Math.floor(minutesUntilEnd),
      currentEndDate: booking.endDate,
      newEndDate,
      additionalHours,
      additionalCost: additionalRentalCost,
      taxRate,
      taxAmount,
      totalAdditional,
      hourlyRate,
      currentHours: booking.hours,
      newTotalHours: booking.hours + additionalHours,
    });
  } catch (err) {
    console.error("Extend check error:", err);
    return NextResponse.json({ error: "Failed to check extension" }, { status: 500 });
  }
}

// POST: Create extension payment intent OR confirm extension
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { action, additionalHours, paymentIntentId } = body;

    const booking = await db.booking.findFirst({
      where: { id, userId: session.user.id, paymentStatus: "PAID" },
      include: { van: true, user: true },
    });

    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    // Check 30-minute rule
    const now = new Date();
    const minutesUntilEnd = (new Date(booking.endDate).getTime() - now.getTime()) / 60000;
    if (minutesUntilEnd < 30) {
      return NextResponse.json({ error: "Extension no longer available" }, { status: 400 });
    }

    // Get settings
    const rateRow = await db.appSettings.findUnique({ where: { key: "hourlyRate" } });
    const hourlyRate = rateRow ? parseFloat(rateRow.value) : 17.99;

    const newEndDate = new Date(booking.endDate);
    newEndDate.setMinutes(newEndDate.getMinutes() + additionalHours * 60);

    const additionalCost = Math.round(additionalHours * hourlyRate * 100) / 100;
    const taxAmount = Math.round(additionalCost * booking.taxRate * 100) / 100;
    const totalAdditional = Math.round((additionalCost + taxAmount) * 100) / 100;

    if (action === "create-intent") {
      // Create Stripe PaymentIntent for the extension amount
      const paymentIntent = await getStripe().paymentIntents.create({
        amount: Math.round(totalAdditional * 100),
        currency: "usd",
        metadata: {
          bookingId: booking.id,
          bookingNumber: booking.bookingNumber,
          userId: session.user.id,
          type: "extension",
          additionalHours: String(additionalHours),
        },
        description: `DADA MOVING — Extension ${booking.bookingNumber} — +${additionalHours}h`,
      });

      return NextResponse.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
    }

    if (action === "confirm") {
      // Verify payment succeeded
      const pi = await getStripe().paymentIntents.retrieve(paymentIntentId);
      if (pi.status !== "succeeded") {
        return NextResponse.json({ error: "Payment not confirmed" }, { status: 400 });
      }

      // Create extension record
      const extension = await db.rentalExtension.create({
        data: {
          bookingId: booking.id,
          originalEndDate: booking.endDate,
          newEndDate,
          additionalHours,
          additionalCost,
          taxRate: booking.taxRate,
          taxAmount,
          totalAdditional,
          stateTaxCode: booking.stateTaxCode,
          stripePaymentId: paymentIntentId,
          paymentStatus: "PAID",
        },
      });

      // Update booking end date and total
      await db.booking.update({
        where: { id: booking.id },
        data: {
          endDate: newEndDate,
          hours: booking.hours + additionalHours,
          totalAmount: booking.totalAmount + totalAdditional,
        },
      });

      const customerName = booking.user.name || "Customer";
      const newEndStr = formatDateTime(newEndDate);

      // Send SMS
      let smsStatus = "failed";
      let smsSentAt: Date | null = null;
      if (booking.user.phone) {
        try {
          await sendSMS(
            booking.user.phone,
            `DADA MOVING: Hello ${customerName}, your rental extension request has been approved successfully. Your new return time is ${newEndStr}. Thank you for choosing DADA MOVING.`
          );
          smsStatus = "sent";
          smsSentAt = new Date();
        } catch (e) { console.error("SMS error:", e); }
      }

      // Send email
      let emailStatus = "failed";
      let emailSentAt: Date | null = null;
      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: booking.user.email,
          subject: `Rental Extension Confirmed – ${booking.bookingNumber} | DADA MOVING`,
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
.header p{color:#93c5fd;margin:6px 0 0;font-size:13px}
.body{padding:32px}
.badge{display:inline-block;background:#dcfce7;color:#16a34a;border-radius:99px;padding:5px 14px;font-size:12px;font-weight:700;margin-bottom:20px}
.section{background:#f8fafc;border-radius:12px;padding:20px;margin-bottom:16px}
.section-title{font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px;margin-bottom:12px}
.row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #e2e8f0;font-size:14px}
.row:last-child{border-bottom:none}
.row .label{color:#64748b}
.row .value{color:#0f172a;font-weight:600}
.total{background:#1e3a8a;border-radius:12px;padding:16px 20px;display:flex;justify-content:space-between;align-items:center;margin-top:16px}
.total .label{color:#93c5fd;font-weight:600}
.total .value{color:#fff;font-size:20px;font-weight:900}
.footer{text-align:center;padding:24px;color:#94a3b8;font-size:12px}
.tagline{color:#f59e0b;font-weight:700;font-size:13px;margin-top:8px}
</style>
</head>
<body>
<div class="wrapper">
<div class="card">
<div class="header">
<h1>DADA MOVING</h1>
<p>Rental Extension Confirmation</p>
</div>
<div class="body">
<span class="badge">✓ Extension Confirmed</span>
<p style="font-size:17px;font-weight:700;color:#0f172a;margin-bottom:6px">Hello ${customerName},</p>
<p style="color:#64748b;font-size:14px;margin-bottom:24px">Your rental extension request has been successfully confirmed.</p>

<div class="section">
<div class="section-title">Extension Details</div>
<div class="row"><span class="label">Booking Reference</span><span class="value">${booking.bookingNumber}</span></div>
<div class="row"><span class="label">Vehicle</span><span class="value">${booking.van.name}</span></div>
<div class="row"><span class="label">New Return Time</span><span class="value">${newEndStr}</span></div>
<div class="row"><span class="label">Additional Time Added</span><span class="value">+${additionalHours}h</span></div>
</div>

<div class="section">
<div class="section-title">Additional Charges</div>
<div class="row"><span class="label">Rental (${additionalHours}h × $${hourlyRate})</span><span class="value">${formatCurrency(additionalCost)}</span></div>
<div class="row"><span class="label">Tax (${(booking.taxRate * 100).toFixed(2)}%)</span><span class="value">${formatCurrency(taxAmount)}</span></div>
</div>

<div class="total">
<span class="label">Additional Charges</span>
<span class="value">${formatCurrency(totalAdditional)}</span>
</div>

<p style="font-size:13px;color:#64748b;margin-top:20px;line-height:1.6">
Please note: you remain responsible for the vehicle until it is returned to DADA MOVING.
</p>
</div>
<div class="footer">
The DADA MOVING Team · Houston, TX<br>
<span class="tagline">Move More, Pay Less.</span>
</div>
</div>
</div>
</body>
</html>`,
        });
        emailStatus = "sent";
        emailSentAt = new Date();
      } catch (e) { console.error("Email error:", e); }

      // Update extension notification status
      await db.rentalExtension.update({
        where: { id: extension.id },
        data: { smsStatus, smsSentAt, emailStatus, emailSentAt },
      });

      // Log notifications
      await db.notificationLog.createMany({
        data: [
          { bookingId: booking.id, type: "extension_email", status: emailStatus, recipient: booking.user.email },
          ...(booking.user.phone ? [{ bookingId: booking.id, type: "extension_sms", status: smsStatus, recipient: booking.user.phone }] : []),
        ],
      });

      return NextResponse.json({ success: true, extension, newEndDate });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Extend error:", err);
    return NextResponse.json({ error: "Failed to process extension" }, { status: 500 });
  }
}
