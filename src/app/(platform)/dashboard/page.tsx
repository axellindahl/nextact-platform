import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Dashboard \u2014 Next Act",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user!.id;
  const displayName =
    user!.user_metadata?.display_name ??
    user!.email?.split("@")[0] ??
    "Idrottare";

  // Fetch data in parallel
  const [streakResult, progressResult, recentResult] = await Promise.all([
    supabase
      .from("user_streaks")
      .select("current_streak, longest_streak, last_activity_date")
      .eq("user_id", userId)
      .single(),
    supabase
      .from("module_progress")
      .select("module_id, lessons_completed, lessons_total, completed_at")
      .eq("user_id", userId)
      .is("completed_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from("lesson_progress")
      .select("lesson_id, status, completed_at")
      .eq("user_id", userId)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(5),
  ]);

  const streak = streakResult.data;
  const currentModule = progressResult.data;
  const recentLessons = recentResult.data ?? [];

  const modulePercent =
    currentModule && currentModule.lessons_total > 0
      ? Math.round(
          (currentModule.lessons_completed / currentModule.lessons_total) * 100
        )
      : 0;

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-navy sm:text-3xl">
          Hej, {displayName}!
        </h1>
        <p className="mt-1 text-charcoal">
          V\u00e4lkommen tillbaka till din mentala tr\u00e4ning.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Streak card */}
        <Card shadow>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/15 text-2xl">
              \ud83d\udd25
            </div>
            <div>
              <p className="text-sm text-charcoal">Dagar i rad</p>
              <p className="font-heading text-2xl font-bold text-navy">
                {streak?.current_streak ?? 0}
              </p>
            </div>
          </div>
          {streak && streak.current_streak > 0 && (
            <p className="mt-3 text-sm text-success">
              {streak.current_streak >= 7
                ? "Fantastiskt! Du \u00e4r p\u00e5 g\u00e5ng!"
                : "Bra jobbat! Forts\u00e4tt s\u00e5!"}
            </p>
          )}
          {(!streak || streak.current_streak === 0) && (
            <p className="mt-3 text-sm text-charcoal">
              B\u00f6rja en ny streak idag!
            </p>
          )}
        </Card>

        {/* Module progress card */}
        <Card shadow>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-2xl">
              \ud83d\udcda
            </div>
            <div>
              <p className="text-sm text-charcoal">Modulframsteg</p>
              <p className="font-heading text-2xl font-bold text-navy">
                {modulePercent}%
              </p>
            </div>
          </div>
          {currentModule ? (
            <div className="mt-3">
              <div className="h-2 overflow-hidden rounded-full bg-off-white-alt">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${modulePercent}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-charcoal">
                {currentModule.lessons_completed} av{" "}
                {currentModule.lessons_total} lektioner klara
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-charcoal">
              P\u00e5b\u00f6rja din f\u00f6rsta modul!
            </p>
          )}
        </Card>

        {/* AI Coach quick access */}
        <Card shadow className="sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan/15 text-2xl">
              \ud83e\udde0
            </div>
            <div>
              <p className="text-sm text-charcoal">AI-coach</p>
              <p className="font-heading text-lg font-bold text-navy">
                Prata med coachen
              </p>
            </div>
          </div>
          <Link
            href="/coach"
            className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-cyan px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cyan/90"
          >
            \u00d6ppna chatten
          </Link>
        </Card>
      </div>

      {/* Today's exercise */}
      <section>
        <h2 className="font-heading text-lg font-semibold text-navy">
          Dagens \u00d6vning
        </h2>
        <Card shadow className="mt-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-heading font-semibold text-navy">
                Forts\u00e4tt d\u00e4r du slutade
              </p>
              <p className="mt-1 text-sm text-charcoal">
                {currentModule
                  ? `Du har ${currentModule.lessons_total - currentModule.lessons_completed} lektioner kvar i din nuvarande modul.`
                  : "Starta din f\u00f6rsta lektion f\u00f6r att komma ig\u00e5ng!"}
              </p>
            </div>
            <Link
              href="/learn"
              className="shrink-0 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              Starta
            </Link>
          </div>
        </Card>
      </section>

      {/* Recent activity */}
      {recentLessons.length > 0 && (
        <section>
          <h2 className="font-heading text-lg font-semibold text-navy">
            Senaste aktivitet
          </h2>
          <div className="mt-3 space-y-2">
            {recentLessons.map((lesson) => (
              <div
                key={lesson.lesson_id}
                className="flex items-center gap-3 rounded-xl bg-white p-3"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/15 text-success">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m4.5 12.75 6 6 9-13.5"
                    />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-navy">
                    Lektion avklarad
                  </p>
                  <p className="text-xs text-charcoal">
                    {lesson.completed_at
                      ? new Date(lesson.completed_at).toLocaleDateString(
                          "sv-SE"
                        )
                      : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
