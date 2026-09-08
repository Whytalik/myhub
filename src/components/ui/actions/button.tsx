import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    "primary" | "secondary" | "outline" | "ghost" | "ghost-accent" | "ghost-danger" | "danger";
  size?: "sm" | "md" | "lg" | "icon" | "icon-sm";
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", isLoading, children, ...props }, ref) => {
    const baseClass =
      "font-semibold flex items-center justify-center gap-2 transition-all duration-150 outline-none focus:outline-none disabled:opacity-50 cursor-pointer active:scale-[0.98]";

    // Variant styles (macOS Sonoma-inspired)
    const variantStyles = {
      primary: "bg-accent text-white hover:opacity-90 shadow-md",
      secondary: "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/[0.04] shadow-sm",
      outline: "bg-transparent border border-white/[0.08] hover:bg-white/5 text-zinc-200",
      ghost: "bg-transparent hover:bg-white/5 text-zinc-400 hover:text-zinc-200",
      // Same ghost chrome, accent/rose hover for icon actions that need a
      // specific tone (schedule/primary-ish vs. destructive) without the
      // heavier border+bg of the `primary`/`danger` variants.
      "ghost-accent": "bg-transparent hover:bg-accent/10 text-zinc-500 hover:text-accent",
      "ghost-danger": "bg-transparent hover:bg-white/5 text-zinc-500 hover:text-rose-400",
      danger: "bg-red-950/20 border border-red-500/20 hover:bg-red-900/10 text-red-400",
    };

    // Size styles (radius lives here, not in baseClass, so icon-sm can use a
    // tighter radius than the rest without fighting a base rounded-lg).
    const sizeStyles = {
      sm: "h-8 px-3 text-xs rounded-lg",
      md: "h-10 px-4 text-sm rounded-lg",
      lg: "h-12 px-6 text-base rounded-lg",
      icon: "w-9 h-9 p-0 rounded-lg",
      // Compact icon-only action (edit/delete/etc. in a list row) — matches the
      // ~28px footprint used throughout the app for inline row actions.
      "icon-sm": "w-7 h-7 p-0 rounded-md",
    };

    return (
      <button
        ref={ref}
        className={`${baseClass} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin flex-shrink-0" />
        ) : null}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button };
