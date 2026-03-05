"use client";

type ProgressDotsProps = {
  total: number;
  current: number;
  completed: Set<number>;
  className?: string;
};

export function ProgressDots({
  total,
  current,
  completed,
  className = "",
}: ProgressDotsProps) {
  return (
    <div
      className={`flex items-center justify-center gap-2 ${className}`}
      role="progressbar"
      aria-valuenow={completed.size}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label={`Lektion ${current + 1} av ${total}`}
    >
      {Array.from({ length: total }, (_, i) => {
        const isActive = i === current;
        const isCompleted = completed.has(i);

        return (
          <span
            key={i}
            className={`
              rounded-full transition-all duration-300
              ${isActive ? "h-3 w-3 bg-[#2670E6] shadow-sm shadow-[#2670E6]/40" : ""}
              ${isCompleted && !isActive ? "h-2 w-2 bg-[#22C55E]" : ""}
              ${!isActive && !isCompleted ? "h-2 w-2 bg-gray-300" : ""}
            `}
            aria-hidden="true"
          />
        );
      })}
    </div>
  );
}
