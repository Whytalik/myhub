import * as React from "react";

interface FormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  error,
  hint,
  required,
  children,
  className = "",
}: FormFieldProps) {
  const wrapperClass = `flex flex-col gap-1.5 ${className}`;

  return (
    <div className={wrapperClass}>
      <label className="text-label">
        {label}
        {required && <span className="text-accent ml-1">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-caption">{hint}</p>}
      {error && <p className="text-caption text-red-400">{error}</p>}
    </div>
  );
}
