import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const profileSchema = z.object({
  character_name: z
    .string()
    .describe("The name the user gave their character"),
  valued_direction: z
    .string()
    .describe(
      "What is most important to the user — their goal or dream, in their own words. Keep it in Swedish, 1-2 sentences max."
    ),
  main_obstacle: z
    .string()
    .describe(
      "The main challenge that stops them — a situation, feeling, or thought pattern. In Swedish, 1-2 sentences max."
    ),
  current_behavior: z
    .string()
    .optional()
    .describe(
      "What they currently do when they hit the obstacle. In Swedish."
    ),
  context: z
    .enum(["sport", "school", "social", "music", "other", "general"])
    .describe("The primary area of life this relates to"),
  context_detail: z
    .string()
    .optional()
    .describe(
      "Specific detail e.g. 'fotboll', 'matte', 'kompisar'"
    ),
  profile_summary: z
    .string()
    .describe(
      "A warm 3-5 sentence summary in Swedish second person (du-form), using the user's own words"
    ),
});

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
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
  const messages: Array<{ role: "user" | "assistant"; content: string }> =
    body.messages;
  const characterName: string = body.characterName;

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Messages required" }, { status: 400 });
  }

  if (!characterName || typeof characterName !== "string") {
    return NextResponse.json(
      { error: "characterName required" },
      { status: 400 }
    );
  }

  const anthropicProvider = createAnthropic({ apiKey });
  const model = anthropicProvider(process.env.AI_MODEL ?? "claude-haiku-4-5-20251001");

  // Format conversation as a single prompt to avoid Anthropic's
  // strict user/assistant alternation requirement (the last message
  // in the onboarding flow is always an assistant PROFIL_KLAR message).
  const conversationText = messages
    .map((m) => `${m.role === "user" ? "Användare" : "Program"}: ${m.content}`)
    .join("\n\n");

  let profileData;
  try {
    const { object } = await generateObject({
      model,
      schema: profileSchema,
      system: `Du är ett system som extraherar strukturerad profildata från ett onboarding-samtal.
Basera din extraktion enbart på vad som faktiskt sagts i konversationen.
Karaktärens namn är: "${characterName}".
Svara alltid på svenska för textfält.`,
      prompt: conversationText,
    });
    profileData = object;
  } catch (err) {
    console.error("[finalize] generateObject error:", err);
    return NextResponse.json({ error: "Kunde inte tolka svaren. Försök igen." }, { status: 500 });
  }

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("character_profiles")
    .upsert(
      {
        user_id: user.id,
        character_name: profileData.character_name,
        valued_direction: profileData.valued_direction,
        main_obstacle: profileData.main_obstacle,
        current_behavior: profileData.current_behavior ?? null,
        context: profileData.context,
        context_detail: profileData.context_detail ?? null,
        profile_summary: profileData.profile_summary,
      },
      { onConflict: "user_id" }
    )
    .select()
    .single();

  if (error) {
    console.error("character_profiles upsert error:", error);
    return NextResponse.json(
      { error: "Failed to save profile" },
      { status: 500 }
    );
  }

  return NextResponse.json({ profile: data });
}
