import { getContentOverview } from "@/lib/actions/admin";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const LESSON_TYPE_LABELS: Record<string, string> = {
  video: "Video",
  text: "Text",
  exercise: "Övning",
  reflection: "Reflektion",
  quiz: "Quiz",
};

const STATUS_VARIANT: Record<string, "default" | "success" | "warning"> = {
  published: "success",
  review: "warning",
  draft: "default",
};

const STATUS_LABELS: Record<string, string> = {
  published: "Publicerad",
  review: "Granskning",
  draft: "Utkast",
};

export default async function ContentPage() {
  const modules = await getContentOverview();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-navy">Innehåll</h1>
        <Link
          href="/admin/content/new"
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          Ny lektion
        </Link>
      </div>

      {modules.map((mod) => (
        <Card key={mod.id} shadow>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold text-navy">
              {mod.order}. {mod.title}
            </h2>
            <span className="text-sm text-charcoal/50">
              {mod.lessons.length} lektioner
            </span>
          </div>

          {mod.lessons.length === 0 ? (
            <p className="text-sm text-charcoal/40">Inga lektioner ännu</p>
          ) : (
            <div className="divide-y divide-light-gray/20">
              {mod.lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-charcoal">
                      {lesson.title}
                    </span>
                    <span className="text-xs text-charcoal/40">
                      {LESSON_TYPE_LABELS[lesson.lesson_type ?? "text"] ??
                        lesson.lesson_type}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={STATUS_VARIANT[lesson.status] ?? "default"}>
                      {STATUS_LABELS[lesson.status] ?? lesson.status}
                    </Badge>
                    <span className="text-xs text-charcoal/30">
                      {new Date(lesson.created_at).toLocaleDateString("sv-SE")}
                    </span>
                    <Link
                      href={`/admin/content/${lesson.id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      Redigera
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
