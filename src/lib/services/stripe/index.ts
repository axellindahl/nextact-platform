import Stripe from "stripe";

export function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key);
}

export async function createCheckoutSession(params: {
  priceId: string;
  customerId?: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const stripe = getStripeClient();
  return stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: params.priceId, quantity: 1 }],
    customer: params.customerId,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    automatic_tax: { enabled: true },
    locale: "sv",
  });
}

export async function createPortalSession(
  customerId: string,
  returnUrl: string
) {
  const stripe = getStripeClient();
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}
