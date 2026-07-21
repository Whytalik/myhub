"use client";

export default function WizardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="glass-card p-8 flex flex-col gap-4 max-w-lg mx-auto">
      <h2 className="text-lg font-bold text-rose-400">Wizard Error</h2>
      <pre className="text-xs text-zinc-400 bg-black/30 p-4 rounded-lg overflow-auto max-h-60">
        {error.message}
        {"\n\n"}
        {error.stack}
        {error.digest && `\n\nDigest: ${error.digest}`}
      </pre>
      <button
        onClick={reset}
        className="px-4 py-2 bg-accent/20 text-accent rounded-lg text-sm"
      >
        Try again
      </button>
    </div>
  );
}
