import Link from "next/link";
import type { ActProcess } from "@/lib/supabase/types";

type ModuleStatus = "completed" | "in_progress" | "locked";

type ModuleCardProps = {
  id: string;
  number: number;
  title: string;
  actProcess: ActProcess | null;
  estimatedMinutes: number | null;
  lessonsCompleted: number;
  lessonsTotal: number;
  status: ModuleStatus;
  colorTheme?: string | null;
};

const actProcessLabels: Record<ActProcess, string> = {
  values: "Värderingar",
  acceptance: "Acceptans",
  defusion: "Defusion",
  present_moment: "Närvarande Ögonblick",
  self_as_context: "Självet som Kontext",
  committed_action: "Engagerat Handlande",
  integration: "Integration",
};

const statusConfig = {
  completed: {
    border: "border-l-success",
    badge: "bg-success/10 text-success",
    badgeText: "Klar",
  },
  in_progress: {
    border: "border-l-primary",
    badge: "bg-primary/10 text-primary",
    badgeText: "Aktiv",
  },
  locked: {
    border: "border-l-light-gray",
    badge: "bg-light-gray/20 text-light-gray",
    badgeText: "Låst",
  },
};

export function ModuleCard({
  id,
  number,
  title,
  actProcess,
  estimatedMinutes,
  lessonsCompleted,
  lessonsTotal,
  status,
}: ModuleCardProps) {
  const config = statusConfig[status];
  const isLocked = status === "locked";

  const content = (
    <div
      className={`
        rounded-xl border-l-4 bg-white px-6 py-5 transition-all
        ${config.border}
        ${isLocked ? "" : "hover:bg-off-white"}
      `}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {/* Module number */}
          <p className="font-mono text-xs font-medium text-light-gray">
            {String(number).padStart(2, "0")}
          </p>

          {/* Title */}
          <h3
            className={`mt-1 font-heading text-xl font-extrabold leading-tight ${
              isLocked ? "text-light-gray" : "text-navy"
            }`}
          >
            {title}
          </h3>

          {/* Meta line */}
          <p className={`mt-1.5 text-sm ${isLocked ? "text-light-gray" : "text-charcoal"}`}>
            {[
              actProcess ? actProcessLabels[actProcess] : null,
              estimatedMinutes ? `${estimatedMinutes} min` : null,
              !isLocked && lessonsTotal > 0
                ? `${lessonsCompleted} av ${lessonsTotal} delar`
                : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>

        {/* Status badge */}
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${config.badge}`}
        >
          {config.badgeText}
        </span>
      </div>
    </div>
  );

  if (isLocked) {
    return <div>{content}</div>;
  }

  return (
    <Link href={`/learn/${id}`} className="block">
      {content}
    </Link>
  );
}
