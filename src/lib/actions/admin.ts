"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { LessonStatus } from "@/lib/supabase/types";

export async function getAdminStats() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const admin = createAdminClient();

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    { count: totalUsers },
    { count: activeUsers },
    { count: totalCompletions },
    { count: activeSubscriptions },
  ] = await Promise.all([
    admin.from("profiles").select("*", { count: "exact", head: true }),
    admin
      .from("user_streaks")
      .select("*", { count: "exact", head: true })
      .gte("last_activity_date", sevenDaysAgo.toISOString()),
    admin
      .from("lesson_progress")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed"),
    admin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .in("subscription_status", ["active", "trialing"]),
  ]);

  return {
    totalUsers: totalUsers ?? 0,
    activeUsers: activeUsers ?? 0,
    totalCompletions: totalCompletions ?? 0,
    activeSubscriptions: activeSubscriptions ?? 0,
  };
}

export async function getUsers(query?: string, page = 1, pageSize = 20) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const admin = createAdminClient();
  const offset = (page - 1) * pageSize;

  let request = admin
    .from("profiles")
    .select(
      "id, display_name, sport, subscription_tier, subscription_status, created_at",
      {
        count: "exact",
      }
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (query) {
    request = request.or(`display_name.ilike.%${query}%`);
  }

  const { data, count, error } = await request;
  if (error) throw new Error(error.message);

  return {
    users: data ?? [],
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  };
}

export async function getContentOverview() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const admin = createAdminClient();

  const { data: modules, error: modulesError } = await admin
    .from("modules")
    .select("id, title, order")
    .order("order", { ascending: true });

  if (modulesError) throw new Error(modulesError.message);

  const { data: lessons, error: lessonsError } = await admin
    .from("lessons")
    .select("id, module_id, title, lesson_type, status, created_at")
    .order("order", { ascending: true });

  if (lessonsError) throw new Error(lessonsError.message);

  const lessonsByModule = new Map<string, typeof lessons>();
  for (const lesson of lessons ?? []) {
    if (!lesson.module_id) continue;
    const existing = lessonsByModule.get(lesson.module_id) ?? [];
    existing.push(lesson);
    lessonsByModule.set(lesson.module_id, existing);
  }

  return (modules ?? []).map((mod) => ({
    ...mod,
    lessons: lessonsByModule.get(mod.id) ?? [],
  }));
}

export async function updateLessonStatus(
  lessonId: string,
  status: LessonStatus
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const admin = createAdminClient();

  const { error } = await admin
    .from("lessons")
    .update({ status })
    .eq("id", lessonId);

  if (error) throw new Error(error.message);
}
