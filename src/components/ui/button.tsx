"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-hover active:brightness-95 shadow-sm shadow-primary/20",
  secondary:
    "border border-primary text-primary hover:bg-primary/5 active:bg-primary/10",
  ghost: "text-charcoal hover:bg-navy/5 active:bg-navy/10",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm rounded-[3rem]",
  md: "px-6 py-3 text-base rounded-[3rem]",
  lg: "px-8 py-4 text-lg rounded-[4rem]",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      className = "",
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`
          inline-flex items-center justify-center font-heading font-semibold
          transition-all duration-200 ease-out cursor-pointer
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary
          disabled:opacity-50 disabled:pointer-events-none
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
export type { ButtonProps, ButtonVariant, ButtonSize };
