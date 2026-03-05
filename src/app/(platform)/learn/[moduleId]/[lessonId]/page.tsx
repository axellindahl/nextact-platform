import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { markLessonStarted } from "@/lib/actions/lessons";
import type { Json } from "@/lib/supabase/types";
import type { ContentBlock } from "@/components/features/lms/lesson-feed";
import { LessonClient } from "./lesson-client";

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
  nextLessonId: string | null
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
          title: b.title ? String(b.title) : undefined,
          content: String(b.content ?? ""),
        });
        break;
      case "exercise_text":
        blocks.push({
          type: "exercise_text",
          prompt: String(b.prompt ?? ""),
          placeholder: b.placeholder ? String(b.placeholder) : undefined,
          maxLength: typeof b.maxLength === "number" ? b.maxLength : undefined,
        });
        break;
      case "exercise_choice":
        blocks.push({
          type: "exercise_choice",
          question: String(b.question ?? ""),
          options: Array.isArray(b.options)
            ? b.options.map((o: unknown) => {
                const opt = o as Record<string, unknown>;
                return {
                  id: String(opt.id ?? ""),
                  label: String(opt.label ?? ""),
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
          content: String(b.content ?? ""),
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

  // Fetch lesson and sibling lessons in parallel
  const [lessonResult, siblingsResult] = await Promise.all([
    supabase
      .from("lessons")
      .select("id, title, content, order, module_id")
      .eq("id", lessonId)
      .single(),
    supabase
      .from("lessons")
      .select("id, order")
      .eq("module_id", moduleId)
      .eq("status", "published")
      .order("order", { ascending: true }),
  ]);

  const lesson = lessonResult.data;
  if (!lesson) notFound();

  // Find next lesson
  const siblings = siblingsResult.data ?? [];
  const currentIndex = siblings.findIndex((s) => s.id === lessonId);
  const nextLesson =
    currentIndex >= 0 && currentIndex < siblings.length - 1
      ? siblings[currentIndex + 1]
      : null;

  // Mark lesson as started
  await markLessonStarted(lessonId);

  // Parse content blocks
  const blocks = parseContentBlocks(
    lesson.content,
    lessonId,
    lesson.title,
    moduleId,
    nextLesson?.id ?? null
  );

  return <LessonClient blocks={blocks} lessonId={lessonId} />;
}
