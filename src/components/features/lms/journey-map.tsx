"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

type StepStatus = "completed" | "active" | "locked";

type Step = {
  id: string;
  order: number;
  title: string;
  status: StepStatus;
};

// Hotspot positions as percentages of the image dimensions.
// Measured from the numbered circles in NextAct_kartan.png.
const HOTSPOT_POSITIONS: Record<number, { x: number; y: number }> = {
  1: { x: 8.2, y: 22 },
  2: { x: 12.5, y: 59 },
  3: { x: 37, y: 54 },
  4: { x: 53, y: 16 },
  5: { x: 47, y: 73 },
  6: { x: 66, y: 59 },
  7: { x: 86, y: 21 },
};

function Hotspot({ step, onClick }: { step: Step; onClick: () => void }) {
  const pos = HOTSPOT_POSITIONS[step.order];
  if (!pos) return null;

  const isActive = step.status === "active";
  const isLocked = step.status === "locked";

  return (
    <button
      onClick={isLocked ? undefined : onClick}
      disabled={isLocked}
      title={step.title}
      aria-label={`Steg ${step.order}: ${step.title}${isLocked ? " (låst)" : ""}`}
      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
      className={`group absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none ${isLocked ? "cursor-not-allowed" : "cursor-pointer"}`}
    >
      {/* Subtle pulse for active step */}
      {isActive && (
        <span className="absolute inset-0 animate-ping rounded-full bg-white/40" />
      )}

      {/* Transparent hit area — size matches the circles in the image */}
      <span
        className={`
          relative flex h-10 w-10 rounded-full transition-all duration-150
          ${!isLocked ? "group-hover:bg-white/20 group-hover:scale-110 group-hover:shadow-lg" : ""}
          ${isActive ? "bg-white/10 scale-110" : ""}
        `}
      />

      {/* Tooltip on hover */}
      {!isLocked && (
        <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-navy px-2.5 py-1 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
          {step.title}
        </span>
      )}
    </button>
  );
}

export function JourneyMap({ steps }: { steps: Step[] }) {
  const router = useRouter();

  return (
    <div className="relative w-full overflow-hidden rounded-2xl shadow-sm">
      <Image
        src="/images/kartan.png"
        alt="Din resa"
        width={1450}
        height={810}
        className="w-full"
        priority
      />
      {steps.map((step) => (
        <Hotspot
          key={step.id}
          step={step}
          onClick={() => router.push(`/learn/${step.id}`)}
        />
      ))}
    </div>
  );
}
