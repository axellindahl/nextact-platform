import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { markLessonStarted } from "@/lib/actions/lessons";
import type { Json } from "@/lib/supabase/types";
import type { ContentBlock } from "@/components/features/lms/lesson-feed";
import { LessonClient } from "./lesson-client";
import { substituteTemplateVars, type TemplateVars } from "@/lib/services/lms/template-vars";

type Props = {
  params: Promise<{ moduleId: string; lessonId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lessonId } = await params;
  const supabase = await createClient();
  const { data: lesson } = await supabase
    .from("lessons")
    .select("title")
    .eq("id", lessonId)
    .single();

  return {
    title: lesson ? `${lesson.title} — Next Act` : "Lektion — Next Act",
  };
}

function parseContentBlocks(
  content: Json,
  lessonId: string,
  lessonTitle: string,
  moduleId: string,
  nextLessonId: string | null,
  templateVars: TemplateVars = {}
): ContentBlock[] {
  if (!Array.isArray(content)) return [];

  const blocks: ContentBlock[] = [];

  for (const block of content) {
    if (typeof block !== "object" || block === null || !("type" in block)) {
      continue;
    }

    const b = block as Record<string, unknown>;

    switch (b.type) {
      case "video":
        blocks.push({
          type: "video",
          title: String(b.title ?? ""),
          videoId: b.videoId ? String(b.videoId) : undefined,
        });
        break;
      case "text":
        blocks.push({
          type: "text",
          title: b.title ? substituteTemplateVars(String(b.title), templateVars) : undefined,
          content: substituteTemplateVars(String(b.content ?? ""), templateVars),
        });
        break;
      case "exercise_text":
        blocks.push({
          type: "exercise_text",
          prompt: substituteTemplateVars(String(b.prompt ?? ""), templateVars),
          placeholder: b.placeholder ? substituteTemplateVars(String(b.placeholder), templateVars) : undefined,
          maxLength: typeof b.maxLength === "number" ? b.maxLength : undefined,
        });
        break;
      case "exercise_choice":
        blocks.push({
          type: "exercise_choice",
          question: substituteTemplateVars(String(b.question ?? ""), templateVars),
          options: Array.isArray(b.options)
            ? b.options.map((o: unknown) => {
                const opt = o as Record<string, unknown>;
                return {
                  id: String(opt.id ?? ""),
                  label: substituteTemplateVars(String(opt.label ?? ""), templateVars),
                };
              })
            : [],
          allowMultiple: b.allowMultiple === true,
        });
        break;
      case "exercise_sorting":
        blocks.push({
          type: "exercise_sorting",
          instruction: String(b.instruction ?? ""),
          items: Array.isArray(b.items)
            ? b.items.map((item: unknown) => {
                const it = item as Record<string, unknown>;
                return {
                  id: String(it.id ?? ""),
                  label: String(it.label ?? ""),
                };
              })
            : [],
        });
        break;
      case "quiz":
        blocks.push({
          type: "quiz",
          question: String(b.question ?? ""),
          options: Array.isArray(b.options)
            ? b.options.map((o: unknown) => {
                const opt = o as Record<string, unknown>;
                return {
                  id: String(opt.id ?? ""),
                  label: String(opt.label ?? ""),
                  correct: opt.correct === true,
                };
              })
            : [],
          explanation: String(b.explanation ?? ""),
        });
        break;
      case "callout":
        blocks.push({
          type: "callout",
          variant: (["insight", "warning", "tip"] as const).includes(
            b.variant as "insight" | "warning" | "tip"
          )
            ? (b.variant as "insight" | "warning" | "tip")
            : "insight",
          content: substituteTemplateVars(String(b.content ?? ""), templateVars),
        });
        break;
      case "ai_prompt":
        blocks.push({
          type: "ai_prompt",
          prompt: String(
            b.prompt ?? "Prata med din AI-coach om den här övningen"
          ),
          lessonId,
        });
        break;
      case "story":
        blocks.push({
          type: "story",
          content: substituteTemplateVars(String(b.content ?? ""), templateVars),
        });
        break;
      case "weekly_task":
        blocks.push({
          type: "weekly_task",
          tasks: Array.isArray(b.tasks)
            ? b.tasks.map((t: unknown) => String(t))
            : [],
          moduleTitle: b.moduleTitle ? String(b.moduleTitle) : undefined,
        });
        break;
      case "bollplank_prompt":
        blocks.push({
          type: "bollplank_prompt",
          prompt: String(b.prompt ?? ""),
        });
        break;
      case "completion":
        // Skipped — we append our own completion card below
        break;
    }
  }

  // Always append a completion card at the end
  blocks.push({
    type: "completion",
    lessonTitle,
    moduleHref: `/learn/${moduleId}`,
    nextLessonHref: nextLessonId
      ? `/learn/${moduleId}/${nextLessonId}`
      : undefined,
  });

  return blocks;
}

export default async function LessonPage({ params }: Props) {
  const { moduleId, lessonId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch lesson, module, sibling lessons, and character profile in parallel
  const [lessonResult, moduleResult, siblingsResult, characterResult] = await Promise.all([
    supabase
      .from("lessons")
      .select("id, title, content, order, module_id")
      .eq("id", lessonId)
      .single(),
    supabase
      .from("modules")
      .select("id, title")
      .eq("id", moduleId)
      .single(),
    supabase
      .from("lessons")
      .select("id, order")
      .eq("module_id", moduleId)
      .eq("status", "published")
      .order("order", { ascending: true }),
    supabase
      .from("character_profiles")
      .select("character_name, valued_direction, main_obstacle, current_behavior, context, context_detail")
      .eq("user_id", user?.id ?? "")
      .maybeSingle(),
  ]);

  const lesson = lessonResult.data;
  if (!lesson) notFound();

  const moduleName = moduleResult.data?.title ?? "";

  // Find next lesson
  const siblings = siblingsResult.data ?? [];
  const currentIndex = siblings.findIndex((s) => s.id === lessonId);
  const nextLesson =
    currentIndex >= 0 && currentIndex < siblings.length - 1
      ? siblings[currentIndex + 1]
      : null;

  // Build template vars from character profile
  const templateVars: TemplateVars = {
    character_name: characterResult.data?.character_name ?? undefined,
    valued_direction: characterResult.data?.valued_direction ?? undefined,
    main_obstacle: characterResult.data?.main_obstacle ?? undefined,
    current_behavior: characterResult.data?.current_behavior ?? undefined,
    context: characterResult.data?.context ?? undefined,
    context_detail: characterResult.data?.context_detail ?? undefined,
  };

  // Mark lesson as started
  await markLessonStarted(lessonId);

  // Parse content blocks
  const blocks = parseContentBlocks(
    lesson.content,
    lessonId,
    lesson.title,
    moduleId,
    nextLesson?.id ?? null,
    templateVars
  );

  return (
    <LessonClient
      blocks={blocks}
      lessonId={lessonId}
      moduleName={moduleName}
      moduleHref={`/learn/${moduleId}`}
      lessonTitle={lesson.title}
    />
  );
}
