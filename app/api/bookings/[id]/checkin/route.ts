import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { resend, FROM_EMAIL } from "@/lib/resend";
import { sendSMS } from "@/lib/twilio";
import { formatDateTime } from "@/lib/utils";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const checkIn = await db.checkIn.findFirst({
      where: { booking: { id, userId: session.user.id } },
    });
    return NextResponse.json(checkIn);
  } catch {
    return NextResponse.json({ error: "Failed to fetch check-in" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    const booking = await db.booking.findFirst({
      where: { id, userId: session.user.id },
      include: { van: true, user: true },
    });

    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    if (booking.paymentStatus !== "PAID") return NextResponse.json({ error: "Booking not paid" }, { status: 400 });

    const {
      photoFront, photoRear, photoRight, photoLeft,
      photoInterior, photoDashboard, photoFuelGauge, photoDamages,
      mileageStart, fuelLevel, driverName, signatureData, termsAccepted,
    } = body;

    // Validate required fields
    if (!photoFront || !photoRear || !photoRight || !photoLeft ||
        !photoInterior || !photoDashboard || !photoFuelGauge) {
      return NextResponse.json({ error: "All 7 required photos must be uploaded" }, { status: 400 });
    }
    if (!mileageStart || !fuelLevel || !driverName) {
      return NextResponse.json({ error: "Mileage, fuel level and driver name are required" }, { status: 400 });
    }
    if (!signatureData || !termsAccepted) {
      return NextResponse.json({ error: "Signature and terms acceptance are required" }, { status: 400 });
    }

    const checkInTime = new Date();

    const checkIn = await db.checkIn.create({
      data: {
        bookingId: booking.id,
        photoFront, photoRear, photoRight, photoLeft,
        photoInterior, photoDashboard, photoFuelGauge,
        photoDamages: photoDamages || [],
        mileageStart: parseInt(mileageStart),
        fuelLevel,
        driverName,
        signatureData,
        termsAccepted: true,
        signedAt: checkInTime,
        checkInTime,
      },
    });

    // Update booking status
    await db.booking.update({
      where: { id: booking.id },
      data: { status: "CHECKIN_COMPLETE" },
    });

    const customerName = booking.user.name || "Customer";
    const vanName = booking.van.name;
    const checkInTimeStr = formatDateTime(checkInTime);
    const address = booking.deliveryAddress;

    // Send email
    let emailStatus = "failed";
    let emailSentAt: Date | null = null;
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: booking.user.email,
        subject: `Confirmation de début de location – DADA MOVING`,
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
body { font-family: -apple-system, sans-serif; background: #f8fafc; margin: 0; padding: 0; }
.wrapper { max-width: 600px; margin: 0 auto; padding: 24px; }
.card { background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 8px rgba(0,0,0,.08); }
.header { background: #1e3a8a; padding: 32px; text-align: center; }
.header h1 { color: #fff; margin: 0; font-size: 22px; font-weight: 900; }
.header p { color: #93c5fd; margin: 6px 0 0; font-size: 13px; }
.body { padding: 32px; }
.badge { display: inline-block; background: #dcfce7; color: #16a34a; border-radius: 99px; padding: 5px 14px; font-size: 12px; font-weight: 700; margin-bottom: 20px; }
.greeting { font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 6px; }
.sub { color: #64748b; font-size: 14px; margin-bottom: 24px; }
.section { background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 16px; }
.section-title { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
.row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
.row:last-child { border-bottom: none; }
.row .label { color: #64748b; }
.row .value { color: #0f172a; font-weight: 600; }
.footer { text-align: center; padding: 24px; color: #94a3b8; font-size: 12px; }
.tagline { color: #f59e0b; font-weight: 700; font-size: 13px; margin-top: 8px; }
</style></head>
<body>
<div class="wrapper">
<div class="card">
  <div class="header">
    <h1>DADA MOVING</h1>
    <p>Confirmation de début de location</p>
  </div>
  <div class="body">
    <span class="badge">✓ Check-In Complété</span>
    <p class="greeting">Bonjour ${customerName},</p>
    <p class="sub">Merci d'avoir choisi DADA MOVING. Votre processus de Check-In a été complété avec succès et votre location est maintenant officiellement active.</p>

    <div class="section">
      <div class="section-title">Détails de votre location</div>
      <div class="row"><span class="label">Numéro de réservation</span><span class="value">${booking.bookingNumber}</span></div>
      <div class="row"><span class="label">Véhicule</span><span class="value">${vanName}</span></div>
      <div class="row"><span class="label">Début de location</span><span class="value">${checkInTimeStr}</span></div>
      <div class="row"><span class="label">Adresse de livraison</span><span class="value">${address}</span></div>
      <div class="row"><span class="label">Kilométrage initial</span><span class="value">${mileageStart} miles</span></div>
      <div class="row"><span class="label">Remis par</span><span class="value">${driverName}</span></div>
    </div>

    <p style="font-size:13px;color:#64748b;line-height:1.6;">Nous vous souhaitons une excellente expérience avec DADA MOVING. En cas de problème, contactez-nous immédiatement.</p>
  </div>
  <div class="footer">
    L'équipe DADA MOVING · Houston, TX<br>
    <span class="tagline">Move More, Pay Less.</span>
  </div>
</div>
</div>
</body>
</html>`,
      });
      emailStatus = "sent";
      emailSentAt = new Date();
    } catch (e) {
      console.error("Email error:", e);
    }

    // Send SMS
    let smsStatus = "failed";
    let smsSentAt: Date | null = null;
    if (booking.user.phone) {
      try {
        await sendSMS(
          booking.user.phone,
          `DADA MOVING: Bonjour ${customerName}, votre Check-In est confirmé. Votre location a commencé à ${checkInTimeStr} à ${address}. Véhicule remis par ${driverName}. Merci pour votre confiance et profitez de votre location.`
        );
        smsStatus = "sent";
        smsSentAt = new Date();
      } catch (e) {
        console.error("SMS error:", e);
      }
    }

    // Update check-in with notification status
    await db.checkIn.update({
      where: { id: checkIn.id },
      data: {
        emailStatus,
        emailSentAt,
        smsStatus,
        smsSentAt,
      },
    });

    // Log notifications
    await db.notificationLog.createMany({
      data: [
        { bookingId: booking.id, type: "checkin_email", status: emailStatus, recipient: booking.user.email },
        ...(booking.user.phone ? [{ bookingId: booking.id, type: "checkin_sms", status: smsStatus, recipient: booking.user.phone }] : []),
      ],
    });

    return NextResponse.json({ success: true, checkIn });
  } catch (err) {
    console.error("Check-in error:", err);
    return NextResponse.json({ error: "Failed to complete check-in" }, { status: 500 });
  }
}
