"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const inputId =
      id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-charcoal font-body"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full rounded-lg border bg-white px-4 py-3
            text-navy font-body placeholder:text-light-gray
            transition-colors duration-150
            focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? "border-red-500 focus:ring-red-400/40 focus:border-red-500" : "border-light-gray"}
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-sm text-red-500 font-body">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
export type { InputProps };
