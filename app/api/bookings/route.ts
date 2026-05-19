import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { generateBookingNumber } from "@/lib/utils";
import { calculatePrice } from "@/lib/tax-calculator";
import { bookingSchema } from "@/lib/validations";

export async function GET(_req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookings = await db.booking.findMany({
      where: { userId: session.user.id },
      include: { van: true, receipt: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(bookings);
  } catch {
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = bookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data", issues: parsed.error.issues }, { status: 400 });
    }

    const { vanId, startDate, startTime, endDate, endTime, pickupLocation: deliveryAddress, stateTaxCode, licenseUrl, notes } = parsed.data;

    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);

    if (end <= start) {
      return NextResponse.json({ error: "End time must be after start time" }, { status: 400 });
    }

    const hours = Math.round(((end.getTime() - start.getTime()) / 3600000) * 10) / 10;
    if (hours < 2) {
      return NextResponse.json({ error: "Minimum rental is 2 hours" }, { status: 400 });
    }

    // Get settings
    const [rateRow, insRow] = await Promise.all([
      db.appSettings.findUnique({ where: { key: "hourlyRate" } }),
      db.appSettings.findUnique({ where: { key: "insuranceFee" } }),
    ]);

    const hourlyRate = rateRow ? parseFloat(rateRow.value) : 17;
    const insuranceFee = insRow ? parseFloat(insRow.value) : 4;
    const price = calculatePrice(hours, stateTaxCode, hourlyRate, insuranceFee);

    const booking = await db.booking.create({
      data: {
        bookingNumber: generateBookingNumber(),
        userId: session.user.id,
        vanId,
        startDate: start,
        endDate: end,
        hours,
        deliveryAddress,
        stateTaxCode: stateTaxCode.toUpperCase(),
        rentalFee: price.rentalFee,
        insuranceFee: price.insuranceFee,
        subtotal: price.subtotal,
        taxRate: price.taxRate,
        taxAmount: price.taxAmount,
        totalAmount: price.total,
        licenseUrl: licenseUrl || null,
        notes: notes || null,
        status: "PENDING",
        paymentStatus: "UNPAID",
      },
      include: { van: true },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
