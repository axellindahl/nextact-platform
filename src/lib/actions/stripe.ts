"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  createCheckoutSession,
  createPortalSession,
} from "@/lib/services/stripe";

export async function checkout(priceId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/logga-in");
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const session = await createCheckoutSession({
    priceId,
    successUrl: `${appUrl}/dashboard?checkout=success`,
    cancelUrl: `${appUrl}/priser`,
  });

  if (!session.url) {
    throw new Error("Failed to create checkout session");
  }

  redirect(session.url);
}

export async function openPortal() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/logga-in");
  }

  // Get the Stripe customer ID from the profile or user metadata
  const stripeCustomerId = user.user_metadata?.stripe_customer_id as
    | string
    | undefined;

  if (!stripeCustomerId) {
    redirect("/priser");
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const session = await createPortalSession(
    stripeCustomerId,
    `${appUrl}/profile`
  );

  redirect(session.url);
}
