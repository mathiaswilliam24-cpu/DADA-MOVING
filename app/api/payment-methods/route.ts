import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { getOrCreateStripeCustomer } from "@/lib/stripe-customer";

// GET: List saved cards
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const cards = await db.savedCard.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(cards);
  } catch {
    return NextResponse.json({ error: "Failed to fetch cards" }, { status: 500 });
  }
}

// POST: Save a new card after SetupIntent confirmation
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { setupIntentId } = await req.json();
    if (!setupIntentId) return NextResponse.json({ error: "setupIntentId required" }, { status: 400 });

    const stripe = getStripe();
    const setupIntent = await stripe.setupIntents.retrieve(setupIntentId, {
      expand: ["payment_method"],
    });

    if (setupIntent.status !== "succeeded") {
      return NextResponse.json({ error: "Setup intent not confirmed" }, { status: 400 });
    }

    const stripeCustomerId = await getOrCreateStripeCustomer(session.user.id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pm = setupIntent.payment_method as any;
    if (!pm || !pm.card) return NextResponse.json({ error: "No payment method found" }, { status: 400 });

    // Check if already saved
    const existing = await db.savedCard.findUnique({
      where: { stripePaymentMethodId: pm.id },
    });
    if (existing) return NextResponse.json(existing);

    // Check if this is the first card → set as default
    const cardCount = await db.savedCard.count({ where: { userId: session.user.id } });

    const saved = await db.savedCard.create({
      data: {
        userId: session.user.id,
        stripeCustomerId,
        stripePaymentMethodId: pm.id,
        brand: pm.card.brand,
        last4: pm.card.last4,
        expMonth: pm.card.exp_month,
        expYear: pm.card.exp_year,
        isDefault: cardCount === 0,
      },
    });

    return NextResponse.json(saved, { status: 201 });
  } catch (err) {
    console.error("Save card error:", err);
    return NextResponse.json({ error: "Failed to save card" }, { status: 500 });
  }
}
