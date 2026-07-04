import * as React from "react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  variant?: "default" | "inline";
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, variant, ...props }, ref) => {
    return (
      <select ref={ref} {...props}>
        {children}
      </select>
    );
  }
);

Select.displayName = "Select";

export { Select };
