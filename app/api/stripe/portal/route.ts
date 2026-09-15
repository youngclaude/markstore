import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { resolveAuthSecret } from "@/lib/auth-secret";
import { createCustomerPortalSession } from "@/lib/stripe";
import { getUserBilling } from "@/lib/billing";

export async function POST(request: Request) {
  try {
    resolveAuthSecret();
  } catch {
    /* continue */
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const userBilling = await getUserBilling(userId);
    
    if (!userBilling?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No billing account found. Please upgrade first." },
        { status: 400 }
      );
    }

    const origin = new URL(request.url).origin;
    const returnUrl = `${origin}/app/settings/billing`;

    const portalSession = await createCustomerPortalSession({
      customerId: userBilling.stripe_customer_id,
      returnUrl,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("Stripe portal error:", error);
    const message = error instanceof Error ? error.message : "Portal session failed";
    
    if (message.includes("STRIPE_SECRET_KEY")) {
      return NextResponse.json(
        { error: "Stripe is not configured. Please set STRIPE_SECRET_KEY secret." },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
