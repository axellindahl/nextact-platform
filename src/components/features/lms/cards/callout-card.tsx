type CalloutVariant = "insight" | "warning" | "tip";

type CalloutCardProps = {
  variant: CalloutVariant;
  content: string;
};

const variantConfig: Record<
  CalloutVariant,
  { bg: string; border: string; iconColor: string }
> = {
  insight: {
    bg: "bg-cyan/10",
    border: "border-cyan/30",
    iconColor: "text-cyan",
  },
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-300/40",
    iconColor: "text-amber-500",
  },
  tip: {
    bg: "bg-success/10",
    border: "border-success/30",
    iconColor: "text-success",
  },
};

function CalloutIcon({ variant }: { variant: CalloutVariant }) {
  const className = `h-6 w-6 shrink-0 ${variantConfig[variant].iconColor}`;

  if (variant === "insight") {
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 18h6M10 22h4M12 2a7 7 0 015 11.9V17a1 1 0 01-1 1H8a1 1 0 01-1-1v-3.1A7 7 0 0112 2z" />
      </svg>
    );
  }

  if (variant === "warning") {
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" />
      </svg>
    );
  }

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export function CalloutCard({ variant, content }: CalloutCardProps) {
  const { bg, border } = variantConfig[variant];

  return (
    <div className="flex h-dvh items-center justify-center bg-off-white p-6">
      <div
        className={`mx-auto flex w-full max-w-2xl items-start gap-4 rounded-2xl border p-6 shadow-sm ${bg} ${border}`}
      >
        <CalloutIcon variant={variant} />
        <p className="text-base leading-relaxed text-navy">{content}</p>
      </div>
    </div>
  );
}
