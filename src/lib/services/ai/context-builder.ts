import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export async function buildUserContext(
  supabase: SupabaseClient<Database>,
  userId: string,
  lessonId?: string
): Promise<string> {
  const [
    profileResult,
    progressResult,
    toughnessResult,
    conversationsResult,
    lessonResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "sport, age_bracket, subscription_tier, display_name, preferred_language"
      )
      .eq("id", userId)
      .single(),

    supabase
      .from("module_progress")
      .select(
        "module_id, lessons_completed, lessons_total, completed_at, modules(title, act_process)"
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),

    supabase
      .from("toughness_model")
      .select(
        "values_score, acceptance_score, defusion_score, present_moment_score, self_as_context_score, committed_action_score, snapshot_date"
      )
      .eq("user_id", userId)
      .order("snapshot_date", { ascending: false })
      .limit(1)
      .maybeSingle(),

    supabase
      .from("ai_conversations")
      .select("summary, context_type, created_at")
      .eq("user_id", userId)
      .not("summary", "is", null)
      .order("created_at", { ascending: false })
      .limit(3),

    lessonId
      ? supabase
          .from("lessons")
          .select(
            "title, lesson_type, content, metadata, modules(title, act_process)"
          )
          .eq("id", lessonId)
          .single()
      : Promise.resolve(null),
  ]);

  const sections: string[] = [];

  // Profile context
  const profile = profileResult.data;
  if (profile) {
    sections.push(
      `## Anvandarprofil
- Namn: ${profile.display_name ?? "Okant"}
- Sport: ${profile.sport}
- Aldersgrupp: ${profile.age_bracket ?? "Ej angiven"}
- Sprak: ${profile.preferred_language}
- Prenumeration: ${profile.subscription_tier}`
    );
  }

  // Module progress
  const progress = progressResult.data;
  if (progress && progress.length > 0) {
    const lines = progress.map((p) => {
      const mod = p.modules as { title: string; act_process: string } | null;
      const pct =
        p.lessons_total > 0
          ? Math.round((p.lessons_completed / p.lessons_total) * 100)
          : 0;
      const status = p.completed_at ? "Klar" : `${pct}%`;
      return `- ${mod?.title ?? "Okand modul"} (${mod?.act_process ?? ""}): ${status}`;
    });
    sections.push(`## Modulframsteg\n${lines.join("\n")}`);
  }

  // Toughness model scores
  const toughness = toughnessResult?.data;
  if (toughness) {
    sections.push(
      `## Mental Styrka (senaste: ${toughness.snapshot_date})
- Varderingar: ${toughness.values_score}
- Acceptans: ${toughness.acceptance_score}
- Defusion: ${toughness.defusion_score}
- Narvarande ogonblick: ${toughness.present_moment_score}
- Sjalvet som kontext: ${toughness.self_as_context_score}
- Engagerat handlande: ${toughness.committed_action_score}`
    );
  }

  // Recent conversation summaries
  const conversations = conversationsResult.data;
  if (conversations && conversations.length > 0) {
    const lines = conversations.map(
      (c) => `- [${c.context_type}] ${c.summary}`
    );
    sections.push(`## Senaste samtal\n${lines.join("\n")}`);
  }

  // Current lesson context
  if (lessonResult && "data" in lessonResult && lessonResult.data) {
    const lesson = lessonResult.data;
    const mod = lesson.modules as { title: string; act_process: string } | null;
    sections.push(
      `## Aktuell lektion
- Titel: ${lesson.title}
- Typ: ${lesson.lesson_type}
- Modul: ${mod?.title ?? "Okand"} (${mod?.act_process ?? ""})`
    );
  }

  if (sections.length === 0) {
    return "Ny anvandare utan tidigare aktivitet.";
  }

  return sections.join("\n\n");
}
