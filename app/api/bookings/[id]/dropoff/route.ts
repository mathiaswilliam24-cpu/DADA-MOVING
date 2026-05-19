import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { resend, FROM_EMAIL } from "@/lib/resend";
import { sendSMS } from "@/lib/twilio";
import { formatDateTime } from "@/lib/utils";

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
      include: { van: true, user: true, checkIn: true },
    });

    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    if (!booking.checkIn) return NextResponse.json({ error: "Check-in not completed" }, { status: 400 });

    const {
      videoUrl, photos, mileageEnd, fuelLevelEnd,
      gpsLatitude, gpsLongitude, gpsAddress,
    } = body;

    if (!mileageEnd || !fuelLevelEnd) {
      return NextResponse.json({ error: "Mileage and fuel level are required" }, { status: 400 });
    }

    const dropOffTime = new Date();

    const dropOff = await db.dropOff.create({
      data: {
        bookingId: booking.id,
        videoUrl: videoUrl || null,
        photos: photos || [],
        mileageEnd: parseInt(mileageEnd),
        fuelLevelEnd,
        gpsLatitude: gpsLatitude || null,
        gpsLongitude: gpsLongitude || null,
        gpsAddress: gpsAddress || null,
        dropOffTime,
      },
    });

    // Update booking status
    await db.booking.update({
      where: { id: booking.id },
      data: { status: "DROPOFF_PENDING" },
    });

    const customerName = booking.user.name || "Customer";
    const vanName = booking.van.name;
    const dropOffTimeStr = formatDateTime(dropOffTime);
    const address = booking.deliveryAddress;

    // Send email
    let emailStatus = "failed";
    let emailSentAt: Date | null = null;
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: booking.user.email,
        subject: `Drop-Off Confirmé – DADA MOVING`,
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
body { font-family: -apple-system, sans-serif; background: #f8fafc; margin: 0; }
.wrapper { max-width: 600px; margin: 0 auto; padding: 24px; }
.card { background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 8px rgba(0,0,0,.08); }
.header { background: #1e3a8a; padding: 32px; text-align: center; }
.header h1 { color: #fff; margin: 0; font-size: 22px; font-weight: 900; }
.body { padding: 32px; }
.badge { display: inline-block; background: #fef3c7; color: #d97706; border-radius: 99px; padding: 5px 14px; font-size: 12px; font-weight: 700; margin-bottom: 20px; }
.alert { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 12px; padding: 16px; margin-bottom: 20px; color: #92400e; font-size: 14px; line-height: 1.6; }
.section { background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 16px; }
.section-title { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
.row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
.row:last-child { border-bottom: none; }
.row .label { color: #64748b; }
.row .value { color: #0f172a; font-weight: 600; }
.footer { text-align: center; padding: 24px; color: #94a3b8; font-size: 12px; }
</style></head>
<body>
<div class="wrapper">
<div class="card">
  <div class="header">
    <h1>DADA MOVING</h1>
  </div>
  <div class="body">
    <span class="badge">Drop-Off Enregistré</span>
    <p style="font-size:17px;font-weight:700;color:#0f172a;margin-bottom:6px;">Bonjour ${customerName},</p>
    <p style="color:#64748b;font-size:14px;margin-bottom:20px;">Merci d'avoir utilisé DADA MOVING. Votre procédure de retour a été complétée avec succès.</p>

    <div class="alert">
      ⚠️ <strong>Important :</strong> Veuillez garder les clés disponibles pour le chauffeur DADA MOVING qui viendra récupérer le véhicule. Vous restez entièrement responsable du véhicule jusqu'à l'arrivée physique de notre chauffeur.
    </div>

    <div class="section">
      <div class="section-title">Détails du retour</div>
      <div class="row"><span class="label">Réservation</span><span class="value">${booking.bookingNumber}</span></div>
      <div class="row"><span class="label">Véhicule</span><span class="value">${vanName}</span></div>
      <div class="row"><span class="label">Heure de Drop-Off</span><span class="value">${dropOffTimeStr}</span></div>
      <div class="row"><span class="label">Adresse</span><span class="value">${address}</span></div>
      <div class="row"><span class="label">Kilométrage final</span><span class="value">${mileageEnd} miles</span></div>
      ${gpsAddress ? `<div class="row"><span class="label">Position GPS</span><span class="value">${gpsAddress}</span></div>` : ""}
    </div>
  </div>
  <div class="footer">
    L'équipe DADA MOVING · Houston, TX<br>
    <strong style="color:#f59e0b;">Move More, Pay Less.</strong>
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
          `DADA MOVING: Merci d'avoir utilisé DADA MOVING. Votre procédure de retour a été complétée avec succès. Veuillez garder les clés disponibles pour le chauffeur DADA MOVING qui viendra récupérer le véhicule. Vous restez entièrement responsable du véhicule jusqu'à l'arrivée physique de notre chauffeur.`
        );
        smsStatus = "sent";
        smsSentAt = new Date();
      } catch (e) {
        console.error("SMS error:", e);
      }
    }

    // Update drop-off with notification status
    await db.dropOff.update({
      where: { id: dropOff.id },
      data: { emailStatus, emailSentAt, smsStatus, smsSentAt },
    });

    // Log notifications
    await db.notificationLog.createMany({
      data: [
        { bookingId: booking.id, type: "dropoff_email", status: emailStatus, recipient: booking.user.email },
        ...(booking.user.phone ? [{ bookingId: booking.id, type: "dropoff_sms", status: smsStatus, recipient: booking.user.phone }] : []),
      ],
    });

    return NextResponse.json({ success: true, dropOff });
  } catch (err) {
    console.error("Drop-off error:", err);
    return NextResponse.json({ error: "Failed to complete drop-off" }, { status: 500 });
  }
}
