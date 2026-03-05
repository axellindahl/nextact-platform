import { NextResponse } from "next/server";
import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildUserContext } from "@/lib/services/ai/context-builder";
import { checkRateLimit } from "@/lib/services/ai/rate-limiter";
import {
  detectCrisis,
  CRISIS_RESPONSE_SV,
} from "@/lib/services/ai/crisis-detection";
import { buildSystemPrompt } from "@/lib/services/ai/system-prompt";
import type { SubscriptionTier } from "@/lib/supabase/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const messages: Array<{ role: string; content: string }> = body.messages;
  const conversationId: string | undefined = body.conversationId;
  const lessonId: string | undefined = body.lessonId;

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Messages required" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Get user profile for tier and context
  const { data: profile } = await admin
    .from("profiles")
    .select(
      "subscription_tier, display_name, sport, age_bracket, preferred_language"
    )
    .eq("id", user.id)
    .single();

  const tier: SubscriptionTier = profile?.subscription_tier ?? "free";

  // Check rate limits
  const rateLimit = await checkRateLimit(admin, user.id, tier);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded",
        remaining: rateLimit.remaining,
        resetAt: rateLimit.resetAt.toISOString(),
      },
      { status: 429 }
    );
  }

  // Crisis detection on latest user message
  const latestUserMessage = messages.findLast((m) => m.role === "user");
  if (latestUserMessage && detectCrisis(latestUserMessage.content)) {
    // Store crisis-flagged message if we have a conversation
    if (conversationId) {
      await admin.from("ai_messages").insert([
        {
          conversation_id: conversationId,
          role: "user" as const,
          content: latestUserMessage.content,
          metadata: { crisis_detected: true },
        },
        {
          conversation_id: conversationId,
          role: "assistant" as const,
          content: CRISIS_RESPONSE_SV,
          metadata: { crisis_response: true },
        },
      ]);
    }

    return NextResponse.json({
      role: "assistant",
      content: CRISIS_RESPONSE_SV,
    });
  }

  // Build structured user context for 5-layer system prompt
  const userContext = await buildUserContext(admin, user.id, lessonId);

  const AGE_MAP: Record<string, "15-17" | "18-20" | "21-25" | "25+"> = {
    "13-14": "15-17",
    "15-18": "15-17",
    "19-25": "21-25",
    "26+": "25+",
  };

  const systemPrompt = buildSystemPrompt({
    name: profile?.display_name ?? "Idrottare",
    sport: profile?.sport ?? "fotboll",
    ageGroup: AGE_MAP[profile?.age_bracket ?? ""] ?? "18-20",
    subscriptionTier: tier,
    conversationSummary: userContext,
  });

  const model = anthropic(process.env.AI_MODEL ?? "claude-haiku-4-5-20251001");

  // Ensure conversation exists
  let activeConversationId = conversationId;
  if (!activeConversationId) {
    const { data: newConvo } = await admin
      .from("ai_conversations")
      .insert({
        user_id: user.id,
        context_type: lessonId ? "lesson" : "general",
        context_id: lessonId ?? null,
      })
      .select("id")
      .single();

    activeConversationId = newConvo?.id;
  }

  const result = streamText({
    model,
    system: systemPrompt,
    messages: messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    onFinish: async ({ text, usage }) => {
      // Store messages
      if (activeConversationId) {
        const lastUserMsg = messages.findLast((m) => m.role === "user");
        const toInsert = [];
        if (lastUserMsg) {
          toInsert.push({
            conversation_id: activeConversationId,
            role: "user" as const,
            content: lastUserMsg.content,
          });
        }
        toInsert.push({
          conversation_id: activeConversationId,
          role: "assistant" as const,
          content: text,
        });
        await admin.from("ai_messages").insert(toInsert);
      }

      // Update usage tracking
      const today = new Date().toISOString().split("T")[0];
      const { data: existing } = await admin
        .from("ai_usage")
        .select("id, messages_count, input_tokens, output_tokens")
        .eq("user_id", user.id)
        .eq("date", today)
        .maybeSingle();

      if (existing) {
        await admin
          .from("ai_usage")
          .update({
            messages_count: existing.messages_count + 1,
            input_tokens: existing.input_tokens + (usage.inputTokens ?? 0),
            output_tokens: existing.output_tokens + (usage.outputTokens ?? 0),
          })
          .eq("id", existing.id);
      } else {
        await admin.from("ai_usage").insert({
          user_id: user.id,
          date: today,
          messages_count: 1,
          input_tokens: usage.inputTokens ?? 0,
          output_tokens: usage.outputTokens ?? 0,
        });
      }
    },
  });

  return result.toTextStreamResponse({
    headers: {
      "X-Conversation-Id": activeConversationId ?? "",
    },
  });
}
