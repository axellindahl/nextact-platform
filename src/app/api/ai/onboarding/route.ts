import { NextResponse } from "next/server";
import { streamText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createClient } from "@/lib/supabase/server";
import {
  detectCrisis,
  CRISIS_RESPONSE_SV,
} from "@/lib/services/ai/crisis-detection";
import { ONBOARDING_SYSTEM_PROMPT } from "@/lib/services/ai/onboarding-prompt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  // Fail fast if API key is not configured
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY is not set");
    return NextResponse.json({ error: "AI not configured" }, { status: 503 });
  }

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

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Messages required" }, { status: 400 });
  }

  const anthropicProvider = createAnthropic({ apiKey });
  const model = anthropicProvider(
    process.env.AI_MODEL ?? "claude-haiku-4-5-20251001"
  );

  // Crisis detection on latest user message
  const latestUserMessage = messages.findLast((m) => m.role === "user");
  if (latestUserMessage && detectCrisis(latestUserMessage.content)) {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(CRISIS_RESPONSE_SV));
        controller.close();
      },
    });
    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  console.log("[onboarding] key prefix:", apiKey.slice(0, 10));
  console.log("[onboarding] model:", process.env.AI_MODEL ?? "claude-3-5-haiku-20241022");
  console.log("[onboarding] messages:", JSON.stringify(messages));

  const result = streamText({
    model: anthropicProvider(process.env.AI_MODEL ?? "claude-3-5-haiku-20241022"),
    system: ONBOARDING_SYSTEM_PROMPT,
    messages: messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    onError: ({ error }) => {
      console.error("[onboarding] streamText error:", JSON.stringify(error));
    },
  });

  return result.toUIMessageStreamResponse();
}
