import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getStripeClient } from "@/lib/services/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import type Stripe from "stripe";
import type {
  SubscriptionTier,
  SubscriptionStatus,
} from "@/lib/supabase/types";

export async function POST(request: Request) {
  const body = await request.text();
  const headerStore = await headers();
  const signature = headerStore.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;
  const stripe = getStripeClient();

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.customer && session.metadata?.user_id) {
        await supabase
          .from("profiles")
          .update({
            subscription_tier: (session.metadata.tier ??
              "standard") as SubscriptionTier,
            subscription_status: "active" as SubscriptionStatus,
          })
          .eq("id", session.metadata.user_id);

        // Store Stripe customer ID in auth metadata
        await supabase.auth.admin.updateUserById(session.metadata.user_id, {
          user_metadata: {
            stripe_customer_id: session.customer as string,
          },
        });
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

      const statusMap: Record<string, SubscriptionStatus> = {
        active: "active",
        trialing: "trialing",
        past_due: "past_due",
        canceled: "canceled",
        unpaid: "expired",
      };

      const mappedStatus = statusMap[subscription.status] ?? "active";

      // Find user by stripe_customer_id in auth metadata
      const { data: users } = await supabase.auth.admin.listUsers();
      const user = users?.users?.find(
        (u) => u.user_metadata?.stripe_customer_id === customerId
      );

      if (user) {
        await supabase
          .from("profiles")
          .update({ subscription_status: mappedStatus })
          .eq("id", user.id);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

      const { data: users } = await supabase.auth.admin.listUsers();
      const user = users?.users?.find(
        (u) => u.user_metadata?.stripe_customer_id === customerId
      );

      if (user) {
        await supabase
          .from("profiles")
          .update({
            subscription_tier: "free" as SubscriptionTier,
            subscription_status: "canceled" as SubscriptionStatus,
          })
          .eq("id", user.id);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
