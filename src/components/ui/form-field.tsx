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
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <label className="text-caption font-mono font-bold tracking-widest uppercase text-muted px-1">
        {label}
        {required && <span className="text-accent ml-1">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-caption font-mono text-muted/60 px-1">{hint}</p>
      )}
      {error && (
        <p className="text-caption font-mono text-red-400 px-1">{error}</p>
      )}
    </div>
  );
}
