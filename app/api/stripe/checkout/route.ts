import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { resolveAuthSecret } from "@/lib/auth-secret";
import { createCheckoutSession } from "@/lib/stripe";
import { getUserBilling } from "@/lib/billing";

export async function POST(request: Request) {
  try {
    resolveAuthSecret();
  } catch {
    /* continue */
  }

  const session = await auth();
  if (!session?.user?.id || !session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const email = session.user.email;

  try {
    const userBilling = await getUserBilling(userId);
    
    if (userBilling?.plan === "pro" && userBilling.subscription_status === "active") {
      return NextResponse.json(
        { error: "You already have an active Pro subscription." },
        { status: 400 }
      );
    }

    const origin = new URL(request.url).origin;
    const successUrl = `${origin}/app/settings/billing?success=true`;
    const cancelUrl = `${origin}/app/settings/billing?canceled=true`;

    const checkoutSession = await createCheckoutSession({
      customerId: userBilling?.stripe_customer_id ?? undefined,
      customerEmail: email,
      userId,
      successUrl,
      cancelUrl,
    });

    if (!checkoutSession.url) {
      return NextResponse.json(
        { error: "Could not create checkout session." },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    const message = error instanceof Error ? error.message : "Checkout failed";
    
    if (message.includes("STRIPE_SECRET_KEY") || message.includes("STRIPE_PRICE_PRO")) {
      return NextResponse.json(
        { error: "Stripe is not configured. Please set STRIPE_SECRET_KEY and STRIPE_PRICE_PRO secrets." },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
