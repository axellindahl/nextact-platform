import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, SubscriptionTier } from "@/lib/supabase/types";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

const TIER_LIMITS: Record<
  SubscriptionTier,
  { limit: number; windowDays: number }
> = {
  free: { limit: 10, windowDays: 7 },
  standard: { limit: 50, windowDays: 1 },
  premium: { limit: Infinity, windowDays: 1 },
};

export async function checkRateLimit(
  supabase: SupabaseClient<Database>,
  userId: string,
  tier: SubscriptionTier
): Promise<RateLimitResult> {
  const config = TIER_LIMITS[tier];

  if (config.limit === Infinity) {
    return { allowed: true, remaining: Infinity, resetAt: new Date() };
  }

  const windowStart = new Date();
  windowStart.setDate(windowStart.getDate() - config.windowDays);
  windowStart.setHours(0, 0, 0, 0);

  const resetAt = new Date(windowStart);
  resetAt.setDate(resetAt.getDate() + config.windowDays);

  const { data, error } = await supabase
    .from("ai_usage")
    .select("messages_count")
    .eq("user_id", userId)
    .gte("date", windowStart.toISOString().split("T")[0])
    .order("date", { ascending: false });

  if (error) {
    throw new Error(`Failed to check rate limit: ${error.message}`);
  }

  const totalMessages = (data ?? []).reduce(
    (sum, row) => sum + row.messages_count,
    0
  );

  const remaining = Math.max(0, config.limit - totalMessages);

  return {
    allowed: remaining > 0,
    remaining,
    resetAt,
  };
}
