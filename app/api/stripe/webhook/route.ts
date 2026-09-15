import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { constructWebhookEvent, getSubscription, getCustomer } from "@/lib/stripe";
import {
  updateUserBilling,
  getUserByStripeCustomer,
  getUserBilling,
  type SubscriptionStatus,
} from "@/lib/billing";
import { getDb } from "@/lib/db";

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  if (!userId || !customerId || !subscriptionId) {
    console.error("Missing data in checkout.session.completed:", { userId, customerId, subscriptionId });
    return;
  }

  const subscription = await getSubscription(subscriptionId);
  const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();

  await updateUserBilling(userId, {
    stripeCustomerId: customerId,
    plan: "pro",
    subscriptionId,
    subscriptionStatus: subscription.status as SubscriptionStatus,
    subscriptionEndsAt: periodEnd,
  });

  console.log(`User ${userId} upgraded to Pro via checkout`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id;

  let user = await getUserByStripeCustomer(customerId);
  
  if (!user) {
    const userId = subscription.metadata?.user_id;
    if (userId) {
      user = await getUserBilling(userId);
    }
  }

  if (!user) {
    console.error("No user found for subscription update:", { customerId, subscriptionId });
    return;
  }

  const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();
  const status = subscription.status as SubscriptionStatus;

  const plan = status === "active" || status === "trialing" ? "pro" : "free";

  await updateUserBilling(user.id, {
    stripeCustomerId: customerId,
    plan,
    subscriptionId,
    subscriptionStatus: status,
    subscriptionEndsAt: periodEnd,
  });

  console.log(`Subscription updated for user ${user.id}: status=${status}, plan=${plan}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const user = await getUserByStripeCustomer(customerId);
  if (!user) {
    console.error("No user found for subscription deletion:", customerId);
    return;
  }

  await updateUserBilling(user.id, {
    plan: "free",
    subscriptionId: null,
    subscriptionStatus: "canceled",
    subscriptionEndsAt: null,
  });

  console.log(`Subscription deleted for user ${user.id}, downgraded to free`);
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = await constructWebhookEvent(body, signature);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    const message = error instanceof Error ? error.message : "Invalid signature";
    
    if (message.includes("STRIPE_WEBHOOK_SECRET")) {
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
