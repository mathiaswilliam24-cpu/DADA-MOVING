import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const card = await db.savedCard.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!card) return NextResponse.json({ error: "Card not found" }, { status: 404 });

    // Detach from Stripe
    await getStripe().paymentMethods.detach(card.stripePaymentMethodId);

    await db.savedCard.delete({ where: { id: card.id } });

    // If it was default, set another card as default
    if (card.isDefault) {
      const next = await db.savedCard.findFirst({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
      });
      if (next) await db.savedCard.update({ where: { id: next.id }, data: { isDefault: true } });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete card" }, { status: 500 });
  }
}

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const card = await db.savedCard.findFirst({ where: { id, userId: session.user.id } });
    if (!card) return NextResponse.json({ error: "Card not found" }, { status: 404 });

    // Unset all defaults first
    await db.savedCard.updateMany({ where: { userId: session.user.id }, data: { isDefault: false } });
    await db.savedCard.update({ where: { id: card.id }, data: { isDefault: true } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update card" }, { status: 500 });
  }
}
