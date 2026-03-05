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

function LockIcon() {
  return (
    <svg
      className="h-5 w-5 text-light-gray"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="h-5 w-5 text-success"
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
  );
}

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
  const percent =
    lessonsTotal > 0 ? Math.round((lessonsCompleted / lessonsTotal) * 100) : 0;
  const isLocked = status === "locked";
  const isCompleted = status === "completed";

  const content = (
    <div
      className={`
        rounded-2xl bg-white p-6 transition-all
        ${isLocked ? "opacity-60" : "shadow-sm hover:shadow-md hover:shadow-navy/5"}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {/* Module number */}
          <span
            className={`
              flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-heading text-sm font-bold
              ${isCompleted ? "bg-success/15 text-success" : ""}
              ${status === "in_progress" ? "bg-primary/10 text-primary" : ""}
              ${isLocked ? "bg-light-gray/20 text-light-gray" : ""}
            `}
          >
            {isCompleted ? <CheckIcon /> : number}
          </span>

          <div>
            <h3
              className={`font-heading text-lg font-semibold ${isLocked ? "text-light-gray" : "text-navy"}`}
            >
              {title}
            </h3>
            {actProcess && (
              <p
                className={`mt-0.5 text-sm ${isLocked ? "text-light-gray" : "text-charcoal"}`}
              >
                {actProcessLabels[actProcess]}
              </p>
            )}
          </div>
        </div>

        {isLocked && <LockIcon />}
      </div>

      {/* Progress bar */}
      {!isLocked && lessonsTotal > 0 && (
        <div className="mt-4">
          <div className="h-1.5 overflow-hidden rounded-full bg-off-white-alt">
            <div
              className={`h-full rounded-full transition-all ${isCompleted ? "bg-success" : "bg-primary"}`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-charcoal">
            <span>
              {lessonsCompleted} av {lessonsTotal} lektioner
            </span>
            {estimatedMinutes !== null && <span>{estimatedMinutes} min</span>}
          </div>
        </div>
      )}

      {isLocked && estimatedMinutes !== null && (
        <p className="mt-4 text-xs text-light-gray">{estimatedMinutes} min</p>
      )}
    </div>
  );

  if (isLocked) {
    return <div aria-disabled="true">{content}</div>;
  }

  return (
    <Link href={`/learn/${id}`} className="block">
      {content}
    </Link>
  );
}
