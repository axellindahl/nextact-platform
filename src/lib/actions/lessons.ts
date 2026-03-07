"use server";

import { createClient } from "@/lib/supabase/server";
import type { Json, ProgressStatus } from "@/lib/supabase/types";

export async function markLessonStarted(lessonId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("lesson_progress").upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      status: "in_progress" as ProgressStatus,
      started_at: new Date().toISOString(),
    },
    { onConflict: "user_id,lesson_id" }
  );

  if (error) throw new Error(error.message);
}

export async function markLessonCompleted(lessonId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // 1. Mark lesson as completed
  const { error } = await supabase
    .from("lesson_progress")
    .update({
      status: "completed" as ProgressStatus,
      completed_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId);

  if (error) throw new Error(error.message);

  // 2. Find which module this lesson belongs to
  const { data: lesson } = await supabase
    .from("lessons")
    .select("module_id")
    .eq("id", lessonId)
    .single();

  if (!lesson?.module_id) return;
  const moduleId = lesson.module_id;

  // 3. Count total and completed lessons in this module
  const { data: allLessons } = await supabase
    .from("lessons")
    .select("id")
    .eq("module_id", moduleId)
    .eq("status", "published");

  const totalCount = allLessons?.length ?? 0;
  const lessonIds = (allLessons ?? []).map((l) => l.id);

  const { data: completedLessons } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .in("lesson_id", lessonIds);

  const completedCount = completedLessons?.length ?? 0;
  const isModuleComplete = completedCount >= totalCount && totalCount > 0;

  // 4. Upsert module_progress — this is what unlocks the next module
  await supabase.from("module_progress").upsert(
    {
      user_id: user.id,
      module_id: moduleId,
      lessons_completed: completedCount,
      lessons_total: totalCount,
      completed_at: isModuleComplete ? new Date().toISOString() : null,
    },
    { onConflict: "user_id,module_id" }
  );
}

export async function submitExerciseResponse(
  lessonId: string,
  responses: Record<string, unknown>
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("lesson_progress")
    .update({ responses: responses as unknown as Json })
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId);

  if (error) throw new Error(error.message);
}

export async function getModuleProgress(moduleId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: lessons, error: lessonsError } = await supabase
    .from("lessons")
    .select("id")
    .eq("module_id", moduleId)
    .eq("status", "published");

  if (lessonsError) throw new Error(lessonsError.message);
  if (!lessons || lessons.length === 0) {
    return { total: 0, completed: 0, inProgress: 0, percent: 0 };
  }

  const lessonIds = lessons.map((l) => l.id);

  const { data: progress, error: progressError } = await supabase
    .from("lesson_progress")
    .select("lesson_id, status")
    .eq("user_id", user.id)
    .in("lesson_id", lessonIds);

  if (progressError) throw new Error(progressError.message);

  const completed = (progress ?? []).filter(
    (p) => p.status === "completed"
  ).length;
  const inProgress = (progress ?? []).filter(
    (p) => p.status === "in_progress"
  ).length;

  return {
    total: lessons.length,
    completed,
    inProgress,
    percent:
      lessons.length > 0 ? Math.round((completed / lessons.length) * 100) : 0,
  };
}

export async function getDailyExercise() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Find the user's current module progress to determine active module
  const { data: moduleProgress } = await supabase
    .from("module_progress")
    .select("module_id, lessons_completed, lessons_total")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  // Find the first module that isn't fully completed
  const activeModule = (moduleProgress ?? []).find(
    (mp) => (mp.lessons_completed ?? 0) < (mp.lessons_total ?? 0)
  );

  if (!activeModule?.module_id) {
    // No active module — get the first module the user hasn't started
    const { data: allModules } = await supabase
      .from("modules")
      .select("id")
      .order("order", { ascending: true });

    const startedModuleIds = new Set(
      (moduleProgress ?? []).map((mp) => mp.module_id)
    );
    const unstartedModule = (allModules ?? []).find(
      (m) => !startedModuleIds.has(m.id)
    );

    if (!unstartedModule) return null; // All modules completed

    const { data: firstLesson } = await supabase
      .from("lessons")
      .select("id, title, lesson_type, module_id")
      .eq("module_id", unstartedModule.id)
      .eq("status", "published")
      .order("order", { ascending: true })
      .limit(1)
      .single();

    return firstLesson;
  }

  // Find the next incomplete lesson in the active module
  const { data: completedLessons } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", user.id)
    .eq("status", "completed");

  const completedIds = new Set(
    (completedLessons ?? []).map((lp) => lp.lesson_id)
  );

  const { data: moduleLessons } = await supabase
    .from("lessons")
    .select("id, title, lesson_type, module_id")
    .eq("module_id", activeModule.module_id)
    .eq("status", "published")
    .order("order", { ascending: true });

  const nextLesson = (moduleLessons ?? []).find((l) => !completedIds.has(l.id));

  return nextLesson ?? null;
}
