import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ActProcess, ProgressStatus } from "@/lib/supabase/types";
import { getModuleAccess } from "@/lib/services/lms/module-unlock";

const actProcessLabels: Partial<Record<ActProcess, string>> = {
  values: "Värderingar",
  acceptance: "Acceptans",
  defusion: "Defusion",
  present_moment: "Närvarande Ögonblick",
  self_as_context: "Självet som Kontext",
  committed_action: "Engagerat Handlande",
  integration: "Integration",
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

  // Guard: redirect to /learn if this module is locked
  const moduleAccess = await getModuleAccess(supabase, userId);
  const access = moduleAccess.get(moduleId);
  if (!access || access === "locked") {
    redirect("/learn");
  }

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

  const actLabel = mod.act_process
    ? actProcessLabels[mod.act_process as ActProcess]
    : null;

  return (
    <div>
      {/* Back link */}
      <Link
        href="/learn"
        className="inline-flex items-center gap-1 text-sm text-charcoal transition-colors hover:text-navy"
      >
        <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M10 12L6 8l4-4" />
        </svg>
        Alla moduler
      </Link>

      {/* Module header — big and bold like Moodle */}
      <div className="mt-6 border-b border-navy/10 pb-8">
        <h1 className="font-heading text-4xl font-extrabold text-navy sm:text-5xl">
          {mod.title}
        </h1>
        {actLabel && (
          <p className="mt-2 text-base font-medium text-primary">{actLabel}</p>
        )}
        {mod.description && (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-charcoal">
            {mod.description}
          </p>
        )}
        <p className="mt-4 text-sm text-charcoal">
          {completedCount} av {lessons.length} lektioner klara
          {mod.estimated_duration_minutes ? ` · ca ${mod.estimated_duration_minutes} min` : ""}
        </p>
      </div>

      {/* Continue button */}
      {firstIncomplete && (
        <div className="mt-6">
          <Link
            href={`/learn/${moduleId}/${firstIncomplete.id}`}
            className="inline-flex items-center rounded-full bg-primary px-8 py-3 font-heading text-base font-bold text-white transition-all hover:bg-primary-hover"
          >
            Fortsätt →
          </Link>
        </div>
      )}

      {/* Lesson list */}
      <div className="mt-8 divide-y divide-navy/8">
        {lessons.map((lesson, i) => {
          const status = progressMap.get(lesson.id);
          const isCompleted = status === "completed";

          return (
            <Link
              key={lesson.id}
              href={`/learn/${moduleId}/${lesson.id}`}
              className="flex items-center gap-4 bg-white px-5 py-4 transition-colors first:rounded-t-xl last:rounded-b-xl hover:bg-[#f0f4ff]"
            >
              {/* Status circle */}
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 font-heading text-sm font-bold ${
                isCompleted
                  ? "border-success bg-success/10 text-success"
                  : "border-light-gray text-charcoal"
              }`}>
                {isCompleted ? (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                ) : (
                  i + 1
                )}
              </span>

              <p className="flex-1 font-heading text-base font-semibold text-navy">
                {lesson.title}
              </p>

              <svg className="h-4 w-4 shrink-0 text-light-gray" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 4l4 4-4 4" />
              </svg>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
