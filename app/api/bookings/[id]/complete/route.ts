import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { resend, FROM_EMAIL } from "@/lib/resend";
import { sendSMS } from "@/lib/twilio";

// Called by a client-side timer 1 minute after drop-off to finalize
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const booking = await db.booking.findFirst({
      where: { id, userId: session.user.id },
      include: { user: true, van: true },
    });

    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    if (booking.status !== "DROPOFF_PENDING") {
      return NextResponse.json({ error: "Booking is not in drop-off pending state" }, { status: 400 });
    }

    // Check if 1 minute has passed
    if (booking.cardAuthExpiresAt && new Date() < booking.cardAuthExpiresAt) {
      const secondsLeft = Math.ceil((booking.cardAuthExpiresAt.getTime() - Date.now()) / 1000);
      return NextResponse.json({ ready: false, secondsLeft });
    }

    // Deactivate card auth and mark as completed
    await db.booking.update({
      where: { id: booking.id },
      data: {
        status: "COMPLETED",
        cardAuthActive: false,
        cardDeactivatedAt: new Date(),
      },
    });

    const customerName = booking.user.name || "Customer";

    // Send final completion SMS
    let smsStatus = "failed";
    if (booking.user.phone) {
      try {
        await sendSMS(
          booking.user.phone,
          `DADA MOVING: Your rental has been successfully completed. Thank you for choosing DADA MOVING. We hope to see you again soon.`
        );
        smsStatus = "sent";
      } catch (e) { console.error("SMS error:", e); }
    }

    // Send final completion email
    let emailStatus = "failed";
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: booking.user.email,
        subject: `Rental Completed Successfully – DADA MOVING`,
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
.body{padding:32px;text-align:center}
.check{width:64px;height:64px;background:#dcfce7;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:28px}
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
<div class="check">✓</div>
<h2 style="color:#0f172a;font-size:22px;font-weight:900;margin-bottom:8px">Rental Completed Successfully</h2>
<p style="color:#64748b;font-size:15px;margin-bottom:8px">Hello ${customerName},</p>
<p style="color:#64748b;font-size:14px;line-height:1.6;max-width:400px;margin:0 auto 24px">Your rental <strong style="color:#0f172a">${booking.bookingNumber}</strong> has been officially completed successfully.</p>
<p style="color:#64748b;font-size:14px;line-height:1.6;max-width:400px;margin:0 auto 24px">Thank you for choosing DADA MOVING. We appreciate your trust and look forward to serving you again.</p>
<p style="color:#64748b;font-size:13px;margin-bottom:0">Your payment card authorization has been released. No further automatic charges will be applied.</p>
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
    } catch (e) { console.error("Email error:", e); }

    // Log notifications
    await db.notificationLog.createMany({
      data: [
        { bookingId: booking.id, type: "completion_email", status: emailStatus, recipient: booking.user.email },
        ...(booking.user.phone ? [{ bookingId: booking.id, type: "completion_sms", status: smsStatus, recipient: booking.user.phone }] : []),
      ],
    });

    return NextResponse.json({ success: true, completed: true });
  } catch (err) {
    console.error("Completion error:", err);
    return NextResponse.json({ error: "Failed to complete rental" }, { status: 500 });
  }
}
