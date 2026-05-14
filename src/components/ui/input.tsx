import * as React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "inline";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "default", ...props }, ref) => {
    const baseStyles = "flex rounded-lg bg-transparent text-body transition-all file:border-0 file:bg-transparent file:text-base placeholder:text-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-50";

    const variants = {
      default: "h-10 w-full border border-border-strong bg-surface/50 px-3 py-2 hover:border-border-strong focus-visible:border-accent/60",
      inline: "border-none px-1 h-auto py-0",
    };

    return (
      <input
        type={type}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
