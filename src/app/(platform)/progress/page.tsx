import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { HexaflexChart } from "@/components/features/lms/hexaflex-chart";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Din Framsteg — Next Act",
};

const BADGE_DEFINITIONS = [
  {
    id: "streak-3",
    label: "3-dagars svit",
    category: "Konsistens",
    threshold: 3,
  },
  { id: "streak-7", label: "Veckosvit", category: "Konsistens", threshold: 7 },
  {
    id: "streak-30",
    label: "Månadssvit",
    category: "Konsistens",
    threshold: 30,
  },
  {
    id: "module-1",
    label: "Första modulen",
    category: "Milstolpe",
    threshold: 1,
  },
  { id: "module-3", label: "Tre moduler", category: "Milstolpe", threshold: 3 },
  {
    id: "module-7",
    label: "Alla moduler",
    category: "Milstolpe",
    threshold: 7,
  },
  {
    id: "reflection-10",
    label: "10 reflektioner",
    category: "Djup",
    threshold: 10,
  },
  {
    id: "reflection-50",
    label: "50 reflektioner",
    category: "Djup",
    threshold: 50,
  },
  { id: "coach-10", label: "10 coachsamtal", category: "Djup", threshold: 10 },
] as const;

export default async function ProgressPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/logga-in");

  const [
    { data: streak },
    { data: toughness },
    { data: modules },
    { data: moduleProgress },
    { data: lessonProgress },
  ] = await Promise.all([
    supabase
      .from("user_streaks")
      .select("current_streak, longest_streak, last_activity_date")
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("toughness_model")
      .select("*")
      .eq("user_id", user.id)
      .order("snapshot_date", { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from("modules")
      .select("id, title, order")
      .order("order", { ascending: true }),
    supabase
      .from("module_progress")
      .select("module_id, lessons_completed, lessons_total")
      .eq("user_id", user.id),
    supabase
      .from("lesson_progress")
      .select("status, completed_at")
      .eq("user_id", user.id)
      .eq("status", "completed"),
  ]);

  const currentStreak = streak?.current_streak ?? 0;
  const longestStreak = streak?.longest_streak ?? 0;
  const lastActivity = streak?.last_activity_date
    ? new Date(streak.last_activity_date)
    : null;

  const hexScores = {
    values: toughness?.values_score ?? 0,
    acceptance: toughness?.acceptance_score ?? 0,
    defusion: toughness?.defusion_score ?? 0,
    present_moment: toughness?.present_moment_score ?? 0,
    self_as_context: toughness?.self_as_context_score ?? 0,
    committed_action: toughness?.committed_action_score ?? 0,
  };

  const progressByModule = new Map(
    (moduleProgress ?? []).map((mp) => [
      mp.module_id,
      { completed: mp.lessons_completed, total: mp.lessons_total },
    ])
  );

  const completedModules = (moduleProgress ?? []).filter(
    (mp) => mp.lessons_completed >= mp.lessons_total && mp.lessons_total > 0
  ).length;

  const completedLessons = (lessonProgress ?? []).length;

  // Streak calendar: last 30 days
  const streakDays = new Set<string>();
  if (lastActivity) {
    // Build backward from last activity date for current streak
    for (let i = 0; i < currentStreak; i++) {
      const d = new Date(lastActivity);
      d.setDate(d.getDate() - i);
      streakDays.add(d.toISOString().slice(0, 10));
    }
  }

  const today = new Date();
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().slice(0, 10);
  });

  // Determine earned badges
  function isBadgeEarned(badgeId: string): boolean {
    if (badgeId.startsWith("streak-")) {
      const threshold = Number(badgeId.split("-")[1]);
      return longestStreak >= threshold;
    }
    if (badgeId.startsWith("module-")) {
      const threshold = Number(badgeId.split("-")[1]);
      return completedModules >= threshold;
    }
    if (badgeId.startsWith("reflection-") || badgeId.startsWith("coach-")) {
      const threshold = Number(badgeId.split("-")[1]);
      return completedLessons >= threshold;
    }
    return false;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <h1 className="font-heading text-2xl font-bold text-navy">
        Din Framsteg
      </h1>

      {/* Streak Section */}
      <Card shadow>
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-sm text-charcoal/60">Nuvarande svit</p>
            <p className="font-heading text-3xl font-bold text-primary">
              {currentStreak}{" "}
              <span className="text-base font-normal text-charcoal/60">
                dagar
              </span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-charcoal/60">Längsta svit</p>
            <p className="font-heading text-xl font-semibold text-charcoal">
              {longestStreak} dagar
            </p>
          </div>
        </div>

        {/* Streak calendar */}
        <div className="mt-4">
          <p className="mb-2 text-xs text-charcoal/50">Senaste 30 dagarna</p>
          <div className="grid grid-cols-10 gap-1.5">
            {last30Days.map((day) => (
              <div
                key={day}
                className={`h-3 w-3 rounded-sm ${
                  streakDays.has(day) ? "bg-primary" : "bg-light-gray/30"
                }`}
                title={day}
              />
            ))}
          </div>
        </div>
      </Card>

      {/* Hexaflex Chart */}
      <Card shadow>
        <h2 className="mb-2 font-heading text-lg font-semibold text-navy">
          Mental styrka-profil
        </h2>
        <p className="mb-4 text-sm text-charcoal/60">
          Dina ACT-processer baserat på dina svar och reflektioner
        </p>
        <HexaflexChart scores={hexScores} />
      </Card>

      {/* Module Progress */}
      <Card shadow>
        <h2 className="mb-4 font-heading text-lg font-semibold text-navy">
          Moduler
        </h2>
        <div className="space-y-3">
          {(modules ?? []).map((mod) => {
            const progress = progressByModule.get(mod.id);
            const completed = progress?.completed ?? 0;
            const total = progress?.total ?? 1;
            const percent =
              total > 0 ? Math.round((completed / total) * 100) : 0;

            return (
              <div key={mod.id}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-charcoal">{mod.title}</span>
                  <span className="text-charcoal/50">
                    {completed}/{total}
                  </span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-light-gray/30">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Training Time Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card shadow>
          <p className="text-sm text-charcoal/60">Träningstid</p>
          <p className="font-heading text-2xl font-bold text-navy">
            {completedLessons * 5}{" "}
            <span className="text-sm font-normal text-charcoal/50">min</span>
          </p>
        </Card>
        <Card shadow>
          <p className="text-sm text-charcoal/60">Reflektionstid</p>
          <p className="font-heading text-2xl font-bold text-navy">
            {Math.round(completedLessons * 3)}{" "}
            <span className="text-sm font-normal text-charcoal/50">min</span>
          </p>
        </Card>
      </div>

      {/* Badges */}
      <Card shadow>
        <h2 className="mb-4 font-heading text-lg font-semibold text-navy">
          Utmärkelser
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {BADGE_DEFINITIONS.map((badge) => {
            const earned = isBadgeEarned(badge.id);
            return (
              <div
                key={badge.id}
                className={`flex flex-col items-center rounded-xl p-3 text-center transition-colors ${
                  earned ? "bg-primary/10" : "bg-light-gray/10 opacity-40"
                }`}
              >
                <div
                  className={`mb-1 flex h-10 w-10 items-center justify-center rounded-full text-lg ${
                    earned
                      ? "bg-primary text-white"
                      : "bg-light-gray/30 text-charcoal/30"
                  }`}
                >
                  {badge.category === "Konsistens" && "🔥"}
                  {badge.category === "Milstolpe" && "⭐"}
                  {badge.category === "Djup" && "💎"}
                </div>
                <span
                  className={`text-xs font-medium ${
                    earned ? "text-charcoal" : "text-charcoal/40"
                  }`}
                >
                  {badge.label}
                </span>
                <span className="text-[10px] text-charcoal/40">
                  {badge.category}
                </span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
