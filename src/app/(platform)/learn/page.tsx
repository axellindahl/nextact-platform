import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ModuleCard } from "@/components/features/lms/module-card";
import { JourneyMap } from "@/components/features/lms/journey-map";
import { getModuleAccess } from "@/lib/services/lms/module-unlock";
import type { ActProcess } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Moduler — Next Act",
};

export default async function ModuleListPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user!.id;

  const { data: characterProfile } = await supabase
    .from("character_profiles")
    .select("character_name")
    .eq("user_id", userId)
    .maybeSingle();

  // Fetch modules, progress, and lesson counts in parallel
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

  // Determine lock/active/completed status using the sequential unlock service
  const moduleAccess = await getModuleAccess(supabase, userId);

  const journeySteps = modules.map((mod) => {
    const access = moduleAccess.get(mod.id) ?? "locked";
    const status: "completed" | "active" | "locked" =
      access === "completed" ? "completed" : access === "active" ? "active" : "locked";
    return { id: mod.id, order: mod.order, title: mod.title, status };
  });

  const moduleCards = modules.map((mod) => {
    const mp = progressMap.get(mod.id);
    const totalLessons = lessonCountMap.get(mod.id) ?? mp?.lessons_total ?? 0;
    const completedLessons = mp?.lessons_completed ?? 0;

    const access = moduleAccess.get(mod.id) ?? "locked";
    const status: "completed" | "in_progress" | "locked" =
      access === "completed"
        ? "completed"
        : access === "active"
          ? "in_progress"
          : "locked";

    return (
      <ModuleCard
        key={mod.id}
        id={mod.id}
        number={mod.order}
        title={mod.title}
        actProcess={(mod.act_process as ActProcess) ?? null}
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
      {!characterProfile && (
        <Link
          href="/onboarding"
          className="group flex items-center gap-4 rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4 transition-colors hover:bg-primary/10"
        >
          <div className="flex-1">
            <p className="font-heading text-sm font-semibold text-navy">
              Personalisera ditt program
            </p>
            <p className="mt-0.5 text-sm text-charcoal">
              Berätta om dig så anpassar vi programmet efter dina mål.
            </p>
          </div>
          <span className="shrink-0 font-heading text-sm font-bold text-primary group-hover:underline">
            Kom igång →
          </span>
        </Link>
      )}

      <div>
        <h1 className="font-heading text-2xl font-bold text-navy sm:text-3xl">
          Din resa
        </h1>
        <p className="mt-1 text-charcoal">
          Klicka på ett steg på kartan för att fortsätta.
        </p>
      </div>

      {/* Interactive journey map */}
      <JourneyMap steps={journeySteps} />

      {/* Step list — fallback / extra detail */}
      <div className="flex flex-col gap-4">{moduleCards}</div>
    </div>
  );
}
