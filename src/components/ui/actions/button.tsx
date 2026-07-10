import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", isLoading, children, ...props }, ref) => {
    const baseClass =
      "rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-150 outline-none focus:outline-none disabled:opacity-50 cursor-pointer active:scale-[0.98]";

    // Variant styles (macOS Sonoma-inspired)
    const variantStyles = {
      primary: "bg-accent text-white hover:opacity-90 shadow-md",
      secondary: "bg-zinc-800 hover:bg-zinc-750 text-zinc-150 border border-white/[0.04] shadow-sm",
      outline: "bg-transparent border border-white/[0.08] hover:bg-white/5 text-zinc-200",
      ghost: "bg-transparent hover:bg-white/5 text-zinc-400 hover:text-zinc-200",
      danger: "bg-red-950/20 border border-red-500/20 hover:bg-red-900/10 text-red-400",
    };

    // Size styles
    const sizeStyles = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-base",
      icon: "w-9 h-9 p-0",
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
