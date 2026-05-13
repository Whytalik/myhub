import * as React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-lg font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

    const variants = {
      primary: "bg-accent text-bg hover:bg-accent-hover shadow-sm",
      secondary: "bg-surface text-text-primary hover:bg-surface-hover border border-border",
      outline: "border border-border bg-transparent text-text-secondary hover:border-accent hover:text-accent",
      ghost: "bg-transparent text-text-secondary hover:bg-surface-hover hover:text-text-primary",
      danger: "bg-danger/10 text-danger hover:bg-danger/20 border border-danger/20",
    };

    const sizes = {
      sm: "h-8 px-3 text-caption",
      md: "h-10 px-4 text-body",
      lg: "h-12 px-6 text-subtitle",
      icon: "h-10 w-10",
    };

    return (
      <button
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
