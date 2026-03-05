import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/services/ai/rate-limiter";
import { ChatInterface } from "@/components/features/coach/chat-interface";
import type { SubscriptionTier } from "@/lib/supabase/types";

export const metadata = {
  title: "AI-Coach | Next Act",
};

export default async function CoachPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/logga-in");
  }

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .single();

  const tier: SubscriptionTier = profile?.subscription_tier ?? "free";

  let remainingMessages: number | undefined;
  let rateLimitReached = false;

  try {
    const rateLimit = await checkRateLimit(admin, user.id, tier);
    remainingMessages = rateLimit.remaining;
    rateLimitReached = !rateLimit.allowed;
  } catch {
    // If rate limit check fails, allow access but don't show count
  }

  return (
    <div className="-mx-4 -my-6 flex h-[calc(100vh-4rem)] flex-col sm:-mx-6 lg:-mx-8 lg:-my-8 lg:h-[calc(100vh-2rem)]">
      <div className="border-b border-navy/10 bg-white px-4 py-4 sm:px-6 lg:px-8">
        <h1 className="font-heading text-xl font-bold text-charcoal">
          AI-Coach
        </h1>
        <p className="mt-1 text-sm text-charcoal/60">
          Din personliga mentala tr{"\u00E4"}ningspartner
        </p>
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatInterface
          remainingMessages={remainingMessages}
          rateLimitReached={rateLimitReached}
        />
      </div>
    </div>
  );
}
