import * as React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-xl text-[11px] font-mono uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";
    
    const variants = {
      primary: "bg-accent text-bg hover:bg-accent/90 font-bold",
      secondary: "bg-raised text-text hover:bg-raised/80 border border-border",
      outline: "border border-border bg-transparent hover:bg-raised text-secondary hover:text-text",
      ghost: "bg-transparent hover:bg-raised text-secondary hover:text-text border-transparent",
      danger: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20",
    };

    const sizes = {
      default: "h-9 px-4 py-2",
      sm: "h-8 px-3 text-[10px]",
      lg: "h-10 px-6",
      icon: "h-9 w-9",
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
