import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ModuleCard } from "@/components/features/lms/module-card";

export const metadata: Metadata = {
  title: "Moduler — Next Act",
};

export default async function ModuleListPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user!.id;

  // Fetch modules and progress in parallel
  const [modulesResult, progressResult, lessonCountsResult] = await Promise.all(
    [
      supabase
        .from("modules")
        .select(
          "id, title, description, act_process, order, estimated_duration_minutes, color_theme"
        )
        .order("order", { ascending: true }),
      supabase
        .from("module_progress")
        .select("module_id, lessons_completed, lessons_total, completed_at")
        .eq("user_id", userId),
      supabase.from("lessons").select("module_id").eq("status", "published"),
    ]
  );

  const modules = modulesResult.data ?? [];
  const progress = progressResult.data ?? [];
  const lessonCounts = lessonCountsResult.data ?? [];

  // Build a map of module_id -> progress
  const progressMap = new Map(progress.map((p) => [p.module_id, p]));

  // Build a map of module_id -> total published lessons
  const lessonCountMap = new Map<string, number>();
  for (const l of lessonCounts) {
    if (l.module_id) {
      lessonCountMap.set(
        l.module_id,
        (lessonCountMap.get(l.module_id) ?? 0) + 1
      );
    }
  }

  // Determine which modules are unlocked using linear progression:
  // A module is unlocked if the previous module is completed, or it's the first module.
  let nextUnlocked = true;

  const moduleCards = modules.map((mod, index) => {
    const mp = progressMap.get(mod.id);
    const totalLessons = lessonCountMap.get(mod.id) ?? mp?.lessons_total ?? 0;
    const completedLessons = mp?.lessons_completed ?? 0;
    const isCompleted =
      mp?.completed_at !== null && mp?.completed_at !== undefined;

    let status: "completed" | "in_progress" | "locked";
    if (isCompleted) {
      status = "completed";
    } else if (nextUnlocked) {
      status =
        completedLessons > 0
          ? "in_progress"
          : index === 0
            ? "in_progress"
            : "in_progress";
      nextUnlocked = false;
    } else {
      status = "locked";
    }

    // If this module is completed, the next one can still be unlocked
    if (isCompleted) {
      nextUnlocked = true;
    }

    return (
      <ModuleCard
        key={mod.id}
        id={mod.id}
        number={mod.order}
        title={mod.title}
        actProcess={mod.act_process}
        estimatedMinutes={mod.estimated_duration_minutes}
        lessonsCompleted={completedLessons}
        lessonsTotal={totalLessons}
        status={status}
        colorTheme={mod.color_theme}
      />
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-navy sm:text-3xl">
          Ditt Program
        </h1>
        <p className="mt-1 text-charcoal">
          Sju moduler som bygger din mentala styrka steg för steg.
        </p>
      </div>

      <div className="flex flex-col gap-4">{moduleCards}</div>
    </div>
  );
}
