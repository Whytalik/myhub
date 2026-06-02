import { ArrowRight, Info } from "lucide-react";

interface SpaceDescriptionProps {
  problem: string;
  solution: string;
  result: string;
  variant?: "full" | "compact";
}

export function SpaceDescription({ problem, solution, result, variant = "full" }: SpaceDescriptionProps) {
  if (variant === "compact") {
    return (
      <div className="group relative rounded-2xl bg-surface/30 border border-border/50 p-6 overflow-hidden backdrop-blur-md transition-all duration-500 hover:bg-surface/50">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Info size={40} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-micro font-bold uppercase tracking-widest text-text-muted">Core Thesis</span>
          </div>
          <p className="text-note text-text-secondary leading-relaxed mb-4 italic">
            &quot;{problem}&quot;
          </p>
          <div className="flex items-center gap-3 text-success font-semibold text-note">
             <div className="h-px flex-1 bg-border/50" />
             <span>{result}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 relative rounded-2xl bg-surface/40 border border-border/50 p-6 md:p-10 overflow-hidden backdrop-blur-xl group">
      {/* Subtle Background Interaction */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-success/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-stretch">
        {/* Problem */}
        <div className="flex-1 flex flex-col group/item">
          <div className="flex items-center gap-2 text-danger/60 mb-3">
            <span className="text-micro font-bold uppercase tracking-widest">01. Challenge</span>
          </div>
          <h4 className="text-note font-bold text-text-primary mb-2">The Friction</h4>
          <p className="text-note text-text-secondary leading-relaxed">{problem}</p>
        </div>

        {/* Arrow (Desktop) */}
        <div className="hidden lg:flex shrink-0 items-center justify-center text-border-strong">
          <div className="w-8 h-px bg-gradient-to-r from-border to-transparent" />
          <ArrowRight size={16} strokeWidth={1.5} className="mx-2" />
          <div className="w-8 h-px bg-gradient-to-l from-border to-transparent" />
        </div>

        {/* Solution */}
        <div className="flex-1 flex flex-col group/item">
          <div className="flex items-center gap-2 text-accent/60 mb-3">
            <span className="text-micro font-bold uppercase tracking-widest">02. Method</span>
          </div>
          <h4 className="text-note font-bold text-text-primary mb-2">The System</h4>
          <p className="text-note text-text-secondary leading-relaxed">{solution}</p>
        </div>

        {/* Arrow (Desktop) */}
        <div className="hidden lg:flex shrink-0 items-center justify-center text-border-strong">
          <div className="w-8 h-px bg-gradient-to-r from-border to-transparent" />
          <ArrowRight size={16} strokeWidth={1.5} className="mx-2" />
          <div className="w-8 h-px bg-gradient-to-l from-border to-transparent" />
        </div>

        {/* Result */}
        <div className="flex-1 flex flex-col group/item">
          <div className="flex items-center gap-2 text-success/60 mb-3">
            <span className="text-micro font-bold uppercase tracking-widest">03. Outcome</span>
          </div>
          <h4 className="text-note font-bold text-text-primary mb-2">The Mastery</h4>
          <p className="text-note text-text-primary font-medium leading-relaxed">{result}</p>
        </div>
      </div>
    </div>
  );
}
