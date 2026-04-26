"use client";

import { AlertTriangle, Copy, ChevronDown } from "lucide-react";
import { useState } from "react";

interface SpaceErrorProps {
  message?: string;
  developerError?: string;
  title?: string;
}

export function SpaceError({
  message = "Failed to load data. Please try refreshing the page later.",
  developerError,
  title = "Loading Error",
}: SpaceErrorProps) {
  const [showDevLog, setShowDevLog] = useState(false);

  return (
    <div className="bg-surface/50 border border-red-500/20 rounded-2xl p-10 flex flex-col items-center text-center gap-6 max-w-lg mx-auto">
      <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
        <AlertTriangle size={28} className="text-red-400" />
      </div>

      <div>
        <h3 className="text-lg font-heading text-text uppercase tracking-tight mb-2">{title}</h3>
        <p className="text-sm text-secondary leading-relaxed">{message}</p>
      </div>

      <button
        onClick={() => window.location.reload()}
        className="bg-accent text-bg px-8 py-3 rounded-xl text-[11px] font-mono uppercase tracking-[0.2em] hover:scale-105 transition-all"
      >
        Refresh Page
      </button>

      {developerError && (
        <div className="w-full mt-4">
          <button
            onClick={() => setShowDevLog(!showDevLog)}
            className="flex items-center gap-2 mx-auto text-[10px] font-mono text-muted hover:text-text transition-colors uppercase tracking-[0.2em]"
          >
            <ChevronDown
              size={12}
              className={`transition-transform ${showDevLog ? "rotate-180" : ""}`}
            />
            <span>Developer Log</span>
          </button>

          {showDevLog && (
            <div className="mt-4 bg-bg border border-border rounded-xl p-4 text-left">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest">
                  Error Details
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(developerError)}
                  className="flex items-center gap-1.5 text-[10px] font-mono text-muted hover:text-text transition-colors"
                >
                  <Copy size={11} />
                  <span>Copy</span>
                </button>
              </div>
              <pre className="text-[11px] font-mono text-secondary whitespace-pre-wrap break-all max-h-48 overflow-y-auto">
                {developerError}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
