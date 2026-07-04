import * as React from "react";

interface FormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ label, error, hint, required, children, className }: FormFieldProps) {
  return (
    <div >
      <label >
        {label}
        {required && <span >*</span>}
      </label>
      {children}
      {hint && !error && (
        <p >{hint}</p>
      )}
      {error && (
        <p >{error}</p>
      )}
    </div>
  );
}
