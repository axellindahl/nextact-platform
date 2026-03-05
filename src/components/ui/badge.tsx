import type { HTMLAttributes } from "react";

type BadgeVariant = "default" | "success" | "warning" | "info";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-navy/10 text-navy",
  success: "bg-success/15 text-green-800",
  warning: "bg-amber-100 text-amber-800",
  info: "bg-cyan/15 text-cyan-800",
};

function Badge({
  variant = "default",
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center rounded-full px-3 py-1
        text-xs font-semibold font-body
        ${variantStyles[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  );
}

export { Badge };
export type { BadgeProps, BadgeVariant };
