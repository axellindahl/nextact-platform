import { NextResponse } from "next/server";
import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { createClient } from "@/lib/supabase/server";
import {
  detectCrisis,
  CRISIS_RESPONSE_SV,
} from "@/lib/services/ai/crisis-detection";
import { ONBOARDING_SYSTEM_PROMPT } from "@/lib/services/ai/onboarding-prompt";

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

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Messages required" }, { status: 400 });
  }

  const model = anthropic(process.env.AI_MODEL ?? "claude-haiku-4-5-20251001");

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

  const result = streamText({
    model,
    system: ONBOARDING_SYSTEM_PROMPT,
    messages: messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  });

  return result.toTextStreamResponse();
}
