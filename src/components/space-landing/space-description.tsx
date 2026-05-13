import { ArrowRight } from "lucide-react";

interface SpaceDescriptionProps {
  problem: string;
  solution: string;
  result: string;
}

export function SpaceDescription({ problem, solution, result }: SpaceDescriptionProps) {
  return (
    <div className="mb-6 relative rounded-[1.25rem] bg-surface/30 border border-border p-6 md:p-8 overflow-hidden backdrop-blur-sm">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[64px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center">
        {/* Problem */}
        <div className="flex-1">
          <div className="flex items-center gap-2 text-text-muted mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-danger/60" />
            <span className="text-micro font-medium uppercase tracking-wider">The Challenge</span>
          </div>
          <p className="text-note text-text-secondary leading-relaxed">{problem}</p>
        </div>

        {/* Bridge */}
        <div className="hidden md:flex shrink-0 items-center justify-center text-text-muted/40">
          <ArrowRight size={20} strokeWidth={1.5} />
        </div>

        {/* Result */}
        <div className="flex-1">
          <div className="flex items-center gap-2 text-text-muted mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-success/60" />
            <span className="text-micro font-medium uppercase tracking-wider">The Outcome</span>
          </div>
          <p className="text-note text-text-primary font-medium leading-relaxed">{result}</p>
        </div>
      </div>
      
      {/* Connection to Nav */}
      <div className="mt-8 pt-6 border-t border-border/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
         <p className="text-note text-accent/90">{solution}</p>
         <span className="text-micro text-text-muted uppercase tracking-widest shrink-0">Explore Tools &darr;</span>
      </div>
    </div>
  );
}
