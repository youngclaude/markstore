import Stripe from "stripe";
import { env } from "cloudflare:workers";

type CloudflareEnv = {
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_PRICE_PRO?: string;
};

function getEnv(): CloudflareEnv {
  return env as unknown as CloudflareEnv;
}

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (stripeClient) return stripeClient;
  
  const secretKey = getEnv().STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  
  stripeClient = new Stripe(secretKey, {
    apiVersion: "2025-06-30",
    httpClient: Stripe.createFetchHttpClient(),
  });
  
  return stripeClient;
}

export function getStripeWebhookSecret(): string {
  const secret = getEnv().STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  }
  return secret;
}

export function getStripePriceId(): string {
  const priceId = getEnv().STRIPE_PRICE_PRO || process.env.STRIPE_PRICE_PRO;
  if (!priceId) {
    throw new Error("STRIPE_PRICE_PRO is not configured. Create a $9/mo recurring price in Stripe Dashboard.");
  }
  return priceId;
}

export async function createCheckoutSession(params: {
  customerId?: string;
  customerEmail: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  const priceId = getStripePriceId();
  
  return stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    customer: params.customerId,
    customer_email: params.customerId ? undefined : params.customerEmail,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      user_id: params.userId,
    },
    subscription_data: {
      metadata: {
        user_id: params.userId,
      },
    },
  });
}

export async function createCustomerPortalSession(params: {
  customerId: string;
  returnUrl: string;
}): Promise<Stripe.BillingPortal.Session> {
  const stripe = getStripe();
  
  return stripe.billingPortal.sessions.create({
    customer: params.customerId,
    return_url: params.returnUrl,
  });
}

export async function constructWebhookEvent(
  body: string,
  signature: string,
): Promise<Stripe.Event> {
  const stripe = getStripe();
  const webhookSecret = getStripeWebhookSecret();
  
  return stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
}

export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  const stripe = getStripe();
  return stripe.subscriptions.retrieve(subscriptionId);
}

export async function getCustomer(customerId: string): Promise<Stripe.Customer | Stripe.DeletedCustomer> {
  const stripe = getStripe();
  return stripe.customers.retrieve(customerId);
}
