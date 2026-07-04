import * as React from "react";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", ...props }, ref) => {
    const textareaClass = `glass-input w-full px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:glass-input-focus transition-all duration-150 resize-none leading-relaxed ${className}`;

    return <textarea ref={ref} className={textareaClass} {...props} />;
  },
);

Textarea.displayName = "Textarea";

export { Textarea };
