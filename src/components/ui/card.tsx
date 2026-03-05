import type { HTMLAttributes } from "react";

type CardPadding = "sm" | "md" | "lg";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: CardPadding;
  shadow?: boolean;
}

const paddingStyles: Record<CardPadding, string> = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

function Card({
  padding = "md",
  shadow = false,
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`
        rounded-2xl bg-off-white-alt
        ${shadow ? "shadow-md shadow-navy/5" : ""}
        ${paddingStyles[padding]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

export { Card };
export type { CardProps };
