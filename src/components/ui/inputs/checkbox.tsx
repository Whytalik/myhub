import * as React from "react";
import { Check } from "lucide-react";

export type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement>;

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = "", ...props }, ref) => {
    const wrapperClass = `relative inline-flex h-4 w-4 shrink-0 items-center justify-center ${className}`;
    const boxClass =
      "pointer-events-none absolute inset-0 flex items-center justify-center rounded border border-white/[0.08] bg-black/25 text-transparent transition-all duration-150 peer-checked:border-accent peer-checked:bg-accent peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-accent/20";

    return (
      <span className={wrapperClass}>
        <input
          type="checkbox"
          ref={ref}
          className="peer absolute inset-0 z-10 h-4 w-4 cursor-pointer opacity-0 disabled:cursor-not-allowed"
          {...props}
        />
        <span className={boxClass}>
          <Check size={10} strokeWidth={3.5} />
        </span>
      </span>
    );
  },
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
