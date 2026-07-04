import * as React from "react";
import { ChevronDown } from "lucide-react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  variant?: "default" | "inline";
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", children, variant = "default", ...props }, ref) => {
    const isInline = variant === "inline";
    const wrapperClass = "relative flex items-center w-full";
    const selectClass = `appearance-none cursor-pointer w-full pr-8 text-sm text-zinc-200 focus:outline-none transition-all duration-150 ${
      isInline ? "bg-transparent border-none p-0" : "glass-input px-3 py-2 focus:glass-input-focus"
    } ${className}`;
    const chevronClass = `absolute pointer-events-none text-zinc-500 ${isInline ? "right-0" : "right-3"}`;

    return (
      <div className={wrapperClass}>
        <select ref={ref} className={selectClass} {...props}>
          {children}
        </select>
        <ChevronDown size={14} className={chevronClass} />
      </div>
    );
  },
);

Select.displayName = "Select";

export { Select };
