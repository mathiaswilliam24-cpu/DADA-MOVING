import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrCreateStripeCustomer } from "@/lib/stripe-customer";
import { getStripe } from "@/lib/stripe";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const stripeCustomerId = await getOrCreateStripeCustomer(session.user.id);

    const setupIntent = await getStripe().setupIntents.create({
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      usage: "off_session",
      metadata: { userId: session.user.id },
    });

    return NextResponse.json({ clientSecret: setupIntent.client_secret });
  } catch (err) {
    console.error("Setup intent error:", err);
    return NextResponse.json({ error: "Failed to create setup intent" }, { status: 500 });
  }
}
