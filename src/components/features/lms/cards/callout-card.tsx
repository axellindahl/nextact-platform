type CalloutVariant = "insight" | "warning" | "tip";

type CalloutCardProps = {
  variant: CalloutVariant;
  content: string;
};

const variantConfig: Record<
  CalloutVariant,
  { bg: string; accent: string; label: string; icon: string }
> = {
  insight: {
    bg: "bg-[#0f1f3d]",
    accent: "text-cyan",
    label: "Insikt",
    icon: "💡",
  },
  warning: {
    bg: "bg-amber-950",
    accent: "text-amber-400",
    label: "Tänk på",
    icon: "⚡",
  },
  tip: {
    bg: "bg-[#0a2e1a]",
    accent: "text-emerald-400",
    label: "Tips",
    icon: "✦",
  },
};

export function CalloutCard({ variant, content }: CalloutCardProps) {
  const { bg, accent, label, icon } = variantConfig[variant];

  return (
    <div className={`w-full px-6 py-12 sm:px-10 sm:py-16 ${bg}`}>
      <div className="mx-auto max-w-2xl">
        <p className={`font-heading text-xs font-bold uppercase tracking-widest ${accent}`}>
          {icon} {label}
        </p>
        <p className="mt-5 font-heading text-2xl font-bold leading-snug text-white sm:text-3xl">
          {content}
        </p>
      </div>
    </div>
  );
}
