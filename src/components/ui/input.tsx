import * as React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "inline";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "default", ...props }, ref) => {
    const baseStyles = "flex rounded-md bg-transparent text-[13px] transition-shadow file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50";
    
    const variants = {
      default: "h-8 w-full border border-border bg-surface/50 px-3 py-1",
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
