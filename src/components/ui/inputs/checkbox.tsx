import * as React from "react";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => {
    return <input type="checkbox" ref={ref} {...props} />;
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
