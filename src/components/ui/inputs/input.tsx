import * as React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "inline";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", type, variant = "default", ...props }, ref) => {
    const hasWidth = className.split(" ").some((c) => c.startsWith("w-") || c === "flex-1");
    const baseClass = `glass-input px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:glass-input-focus transition-all duration-150 ${hasWidth ? "" : "w-full"} [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [appearance:textfield]`;
    const variantClass = variant === "inline" ? "bg-transparent border-none focus:ring-0 p-0" : "";

    return (
      <input
        type={type}
        ref={ref}
        className={`${baseClass} ${variantClass} ${className}`}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

export { Input };
