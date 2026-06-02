import * as React from "react";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  variant?: "default" | "inline";
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, variant = "default", ...props }, ref) => {
    const baseStyles = "flex h-8 w-full rounded-md bg-transparent px-3 py-1 text-note font-mono uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer text-inherit";

    const variants = {
      default: "border border-accent/20 bg-surface/50 hover:border-accent/50 focus-visible:border-accent",
      inline: "border border-border/50 bg-raised h-auto py-0.5 px-2 hover:border-accent/50 focus-visible:border-accent",
    };

    return (
      <div className={`relative flex items-center group ${className}`}>
        <select
          className={`${baseStyles} ${variants[variant]} pr-6 [&>option]:bg-surface [&>option]:text-text`}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <div className="absolute right-2 pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity">
          <svg
            width="8"
            height="8"
            viewBox="0 0 10 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 3.5L5 7.5L9 3.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
