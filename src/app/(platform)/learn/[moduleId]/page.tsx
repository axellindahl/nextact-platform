import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ActProcess, ProgressStatus } from "@/lib/supabase/types";

const actProcessLabels: Record<ActProcess, string> = {
  values: "Värderingar",
  acceptance: "Acceptans",
  defusion: "Defusion",
  present_moment: "Närvarande Ögonblick",
  self_as_context: "Självet som Kontext",
  committed_action: "Engagerat Handlande",
  integration: "Integration",
};

const lessonTypeIcons: Record<string, string> = {
  video: "Film",
  text: "Text",
  exercise: "Övning",
  reflection: "Reflektion",
  quiz: "Quiz",
};

type Props = {
  params: Promise<{ moduleId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { moduleId } = await params;
  const supabase = await createClient();
  const { data: mod } = await supabase
    .from("modules")
    .select("title")
    .eq("id", moduleId)
    .single();

  return {
    title: mod ? `${mod.title} — Next Act` : "Modul — Next Act",
  };
}

export default async function ModuleDetailPage({ params }: Props) {
  const { moduleId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user!.id;

  // Fetch module, lessons, and progress in parallel
  const [moduleResult, lessonsResult, progressResult] = await Promise.all([
    supabase
      .from("modules")
      .select(
        "id, title, description, act_process, estimated_duration_minutes, order"
      )
      .eq("id", moduleId)
      .single(),
    supabase
      .from("lessons")
      .select("id, title, order, lesson_type, duration_seconds")
      .eq("module_id", moduleId)
      .eq("status", "published")
      .order("order", { ascending: true }),
    supabase
      .from("lesson_progress")
      .select("lesson_id, status")
      .eq("user_id", userId),
  ]);

  const mod = moduleResult.data;
  if (!mod) notFound();

  const lessons = lessonsResult.data ?? [];
  const progressMap = new Map(
    (progressResult.data ?? []).map((p) => [
      p.lesson_id,
      p.status as ProgressStatus,
    ])
  );

  // Find the first incomplete lesson for the "Fortsätt" button
  const firstIncomplete = lessons.find(
    (l) => progressMap.get(l.id) !== "completed"
  );

  const completedCount = lessons.filter(
    (l) => progressMap.get(l.id) === "completed"
  ).length;

  return (
    <div className="space-y-8">
      {/* Back link */}
      <Link
        href="/learn"
        className="inline-flex items-center gap-1 text-sm text-charcoal transition-colors hover:text-navy"
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M10 12L6 8l4-4" />
        </svg>
        Alla moduler
      </Link>

      {/* Module header */}
      <div>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 font-heading text-sm font-bold text-primary">
            {mod.order}
          </span>
          <div>
            <h1 className="font-heading text-2xl font-bold text-navy sm:text-3xl">
              {mod.title}
            </h1>
            {mod.act_process && (
              <p className="text-sm text-charcoal">
                {actProcessLabels[mod.act_process]}
              </p>
            )}
          </div>
        </div>

        {mod.description && (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-charcoal">
            {mod.description}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-charcoal">
          <span>
            {completedCount} av {lessons.length} lektioner klara
          </span>
          {mod.estimated_duration_minutes && (
            <>
              <span
                className="h-1 w-1 rounded-full bg-light-gray"
                aria-hidden="true"
              />
              <span>ca {mod.estimated_duration_minutes} min</span>
            </>
          )}
        </div>

        {/* Progress bar */}
        {lessons.length > 0 && (
          <div className="mt-3 h-1.5 max-w-md overflow-hidden rounded-full bg-off-white-alt">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{
                width: `${Math.round((completedCount / lessons.length) * 100)}%`,
              }}
            />
          </div>
        )}
      </div>

      {/* Continue button */}
      {firstIncomplete && (
        <Link
          href={`/learn/${moduleId}/${firstIncomplete.id}`}
          className="inline-flex items-center rounded-[3rem] bg-primary px-6 py-3 font-heading text-base font-semibold text-white shadow-sm shadow-primary/20 transition-all hover:bg-primary-hover"
        >
          Fortsätt
        </Link>
      )}

      {/* Lesson list */}
      <div className="flex flex-col gap-3">
        {lessons.map((lesson, i) => {
          const status = progressMap.get(lesson.id);
          const isCompleted = status === "completed";
          const isInProgress = status === "in_progress";

          return (
            <Link
              key={lesson.id}
              href={`/learn/${moduleId}/${lesson.id}`}
              className="flex items-center gap-4 rounded-xl bg-white p-4 transition-all hover:shadow-sm hover:shadow-navy/5"
            >
              {/* Status indicator */}
              <span
                className={`
                  flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-heading text-sm font-bold
                  ${isCompleted ? "bg-success/15 text-success" : ""}
                  ${isInProgress ? "bg-primary/10 text-primary" : ""}
                  ${!isCompleted && !isInProgress ? "bg-off-white-alt text-charcoal" : ""}
                `}
              >
                {isCompleted ? (
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                ) : (
                  i + 1
                )}
              </span>

              <div className="min-w-0 flex-1">
                <p className="font-heading text-sm font-semibold text-navy">
                  {lesson.title}
                </p>
                <p className="mt-0.5 text-xs text-charcoal">
                  {lessonTypeIcons[lesson.lesson_type ?? "text"] ?? "Lektion"}
                  {lesson.duration_seconds
                    ? ` · ${Math.ceil(lesson.duration_seconds / 60)} min`
                    : ""}
                </p>
              </div>

              {/* Arrow */}
              <svg
                className="h-4 w-4 shrink-0 text-light-gray"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M6 4l4 4-4 4" />
              </svg>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
