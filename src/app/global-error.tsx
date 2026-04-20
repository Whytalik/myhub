"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global System Error:", error);
  }, [error]);

  return (
    <html>
      <body className="bg-[#0f0d0a] text-white font-sans antialiased h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8 text-center animate-in fade-in zoom-in-95 duration-500">
          {/* Icon */}
          <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
             <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full" />
             <AlertCircle size={64} className="text-red-500 relative z-10" />
          </div>

          {/* Text */}
          <div className="space-y-3">
            <h1 className="text-3xl font-black uppercase tracking-tighter italic">System Kernel Panic</h1>
            <p className="text-muted text-[13px] leading-relaxed">
              A critical error occurred in the system core. The Personal OS environment was safely suspended to prevent data corruption.
            </p>
            {error.digest && (
              <div className="bg-red-500/5 border border-red-500/10 p-2 rounded-lg">
                <code className="text-[10px] font-mono text-red-400">ID: {error.digest}</code>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => reset()}
              className="flex items-center justify-center gap-2 w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all"
            >
              <RotateCcw size={16} />
              Reboot Environment
            </button>
            
            <Link
              href="/home"
              className="flex items-center justify-center gap-2 w-full py-4 bg-raised border border-border rounded-2xl font-bold uppercase tracking-widest text-[11px] text-muted hover:text-white transition-all"
            >
              <Home size={14} />
              Emergency Exit to Home
            </Link>
          </div>

          {/* Footer Metadata */}
          <p className="text-[9px] font-mono uppercase tracking-[0.3em] opacity-30">
            Error Handler v1.0 // MyHub OS
          </p>
        </div>
      </body>
    </html>
  );
}
